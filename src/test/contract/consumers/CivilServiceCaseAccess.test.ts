import {MatchersV3, PactV3, SpecificationVersion} from '@pact-foundation/pact';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {BusinessProcess} from 'models/businessProcess';
import {CaseRole} from 'form/models/caseRoles';
import {DashboardClaimantItem, DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {PACT_DIRECTORY_PATH} from '../utils';

const {like, regex} = MatchersV3;
const CASE_ID = '1111222233334444';
const REFERENCE = '000MC001';
const USER_ID = 'cui-user-id';
const TOKEN = 'Bearer some-access-token';
const PIN = '123456';
const OCMC_PIN = '12345678';
const REDIRECT = 'https://moneyclaims.aat.platform.hmcts.net/claim/000MC001';
const auth = {Authorization: TOKEN};

// A fresh request and empty session role cache ensure retrieval performs both calls.
const request = (query = {}): AppRequest => ({
  session: {user: {id: USER_ID, accessToken: 'some-access-token'}, userCaseRolesCache: {}},
  locals: {}, params: {id: CASE_ID}, query,
} as unknown as AppRequest);

function caseResponse(defendant = false) {
  return {
    id: like(Number(CASE_ID)),
    state: defendant ? 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT' : 'CASE_ISSUED',
    last_modified: like('2025-02-03T10:15:30'),
    case_data: {
      legacyCaseReference: like(REFERENCE), totalClaimAmount: like(1000),
      applicant1: {type: 'INDIVIDUAL', partyName: like('Alex Example'), individualFirstName: like('Alex'), individualLastName: like('Example')},
      respondent1: {type: 'COMPANY', partyName: like('Example Services'), companyName: like('Example Services')},
      businessProcess: {status: defendant ? 'STARTED' : 'FINISHED', camundaEvent: 'CREATE_LIP_CLAIM'},
    },
  };
}

function assertClaim(claim: Claim, defendant = false) {
  expect(claim).toBeInstanceOf(Claim);
  expect(claim.id).toBe(CASE_ID);
  expect(claim.ccdState).toBe(defendant ? 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT' : 'CASE_ISSUED');
  expect(claim.lastModifiedDate).toBe('2025-02-03T10:15:30');
  expect(claim.legacyCaseReference).toBe(REFERENCE);
  expect(claim.totalClaimAmount).toBe(1000);
  expect(claim.applicant1.partyDetails.firstName).toBe('Alex');
  expect(claim.respondent1.partyDetails.partyName).toBe('Example Services');
  expect(claim.businessProcess).toMatchObject({status: defendant ? 'STARTED' : 'FINISHED', camundaEvent: 'CREATE_LIP_CLAIM'});
  expect(Object.assign(new BusinessProcess(), claim.businessProcess).hasBusinessProcessFinished()).toBe(!defendant);
}

describe('Civil Service case reads, dashboards and defendant assignment', () => {
  let provider: PactV3;
  beforeEach(() => {
    provider = new PactV3({spec: SpecificationVersion.SPECIFICATION_VERSION_V4, consumer: 'civil_citizen_ui', provider: 'civil_service',
      dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
  });
  const exercise = (check: (client: CivilServiceClient) => Promise<void>) =>
    provider.executeTest(server => check(new CivilServiceClient(server.url)));

  test.each([
    {name: 'claimant', role: CaseRole.CLAIMANT, defendant: false},
    {name: 'defendant', role: CaseRole.DEFENDANT, defendant: true},
    {name: 'no roles', role: undefined, defendant: false},
  ])('retrieves and converts a case with $name access', async example => {
    const state = `Case details and ${example.name} access are available`;
    provider.addInteraction({states: [{description: state}], uponReceiving: `case details for ${example.name} access`,
      withRequest: {method: 'GET', path: `/cases/${CASE_ID}`, headers: auth},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: caseResponse(example.defendant)}});
    provider.addInteraction({states: [{description: state}], uponReceiving: `case roles for ${example.name} access`,
      withRequest: {method: 'GET', path: `/cases/${CASE_ID}/userCaseRoles`, headers: auth},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: example.role ? [example.role] : []}});
    await exercise(async client => {
      const claim = await client.retrieveClaimDetails(CASE_ID, request());
      assertClaim(claim, example.defendant);
      expect(claim.caseRole).toBe(example.role);
    });
  });

  test('propagates a case-not-found response', async () => {
    provider.addInteraction({states: [{description: 'The requested case does not exist'}], uponReceiving: 'a request for missing case details',
      withRequest: {method: 'GET', path: `/cases/${CASE_ID}`, headers: auth}, willRespondWith: {status: 404}});
    await exercise(async client => {
      await expect(client.retrieveClaimDetails(CASE_ID, request())).rejects.toMatchObject({isAxiosError: true, response: {status: 404}});
    });
  });

  describe.each(['claimant', 'defendant'] as const)('%s dashboard', role => {
    test.each([1, 2])('converts dashboard page %s', async page => {
      const entries = [false, true].map(ocmc => ({
        claimId: like(ocmc ? '2222333344445555' : CASE_ID), claimNumber: like(ocmc ? '000MC002' : REFERENCE),
        claimantName: like('Alex Example'), defendantName: like('Example Services'),
        claimAmount: like('1000.00'), status: 'CASE_DISMISSED', ocmc,
      }));
      provider.addInteraction({states: [{description: `The ${role} dashboard page ${page} is available`}],
        uponReceiving: `a request for ${role} dashboard page ${page}`,
        withRequest: {method: 'GET', path: `/cases/${role}/${USER_ID}`, query: {page: String(page)}, headers: auth},
        willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {claims: page === 1 ? entries : [], totalPages: like(page === 1 ? 2 : 0)}}});
      await exercise(async client => {
        const req = request(page === 1 ? {} : {[`${role}Page`]: '2'});
        const result = role === 'claimant' ? await client.getClaimsForClaimant(req) : await client.getClaimsForDefendant(req);
        expect(result.totalPages).toBe(page === 1 ? 2 : 0);
        expect(result.claims).toHaveLength(page === 1 ? 2 : 0);
        for (const [index, item] of result.claims.entries()) {
          expect(item).toBeInstanceOf(role === 'claimant' ? DashboardClaimantItem : DashboardDefendantItem);
          expect(item).toMatchObject({claimId: index ? '2222333344445555' : CASE_ID, claimNumber: index ? '000MC002' : REFERENCE,
            claimantName: 'Alex Example', defendantName: 'Example Services', claimAmount: '1000.00', status: 'CASE_DISMISSED', ocmc: !!index});
          // URLs are built by DashboardItem; the provider DTO does not expose a URL field.
          expect(item.getHref()).toBe(`${index ? config.get<string>('services.cmc.url') : ''}/dashboard/${item.claimId}/${role}`);
        }
      });
    });
  });

  test('validates a Civil PIN without bearer authorisation and converts the case', async () => {
    provider.addInteraction({states: [{description: 'A Civil reference and PIN are valid'}], uponReceiving: 'a public Civil PIN validation',
      withRequest: {method: 'POST', path: `/assignment/reference/${REFERENCE}`, headers: {'Content-Type': 'application/json'}, body: {pin: PIN}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: caseResponse()}});
    await exercise(async client => {
      assertClaim(await client.verifyPin(request(), PIN, REFERENCE));
    });
  });

  test.each([{name: 'invalid PIN', status: 400}, {name: 'missing claim', status: 401}])('rejects Civil PIN validation for $name', async example => {
    provider.addInteraction({states: [{description: `Civil PIN validation fails for ${example.name}`}], uponReceiving: `a Civil PIN request with ${example.name}`,
      withRequest: {method: 'POST', path: `/assignment/reference/${REFERENCE}`, headers: {'Content-Type': 'application/json'}, body: {pin: PIN}},
      willRespondWith: {status: example.status}});
    await exercise(async client => {
      await expect(client.verifyPin(request(), PIN, REFERENCE)).rejects.toMatchObject({isAxiosError: true, response: {status: example.status}});
    });
  });

  test('returns the OCMC redirect string', async () => {
    // The runtime response is a raw URL labelled application/json. The provider
    // verifies this legacy response as exact text while retaining its real header.
    provider.addInteraction({states: [{description: 'An OCMC reference and PIN are valid'}], uponReceiving: 'a public OCMC PIN validation',
      withRequest: {method: 'POST', path: `/assignment/reference/${REFERENCE}/ocmc`, headers: {'Content-Type': 'application/json'}, body: {pin: OCMC_PIN}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: regex('^https://moneyclaims[.]aat[.]platform[.]hmcts[.]net/claim/000MC001$', REDIRECT)}});
    await exercise(async client => {
      await expect(client.verifyOcmcPin(OCMC_PIN, REFERENCE)).resolves.toBe(REDIRECT);
    });
  });

  test('does not return a redirect for an invalid OCMC PIN', async () => {
    provider.addInteraction({states: [{description: 'An OCMC PIN is invalid'}], uponReceiving: 'an invalid OCMC PIN validation',
      withRequest: {method: 'POST', path: `/assignment/reference/${REFERENCE}/ocmc`, headers: {'Content-Type': 'application/json'}, body: {pin: OCMC_PIN}},
      willRespondWith: {status: 400}});
    await exercise(async client => {
      await expect(client.verifyOcmcPin(OCMC_PIN, REFERENCE)).rejects.toMatchObject({isAxiosError: true, response: {status: 400}});
    });
  });

  test.each([
    {name: 'linked', status: 200, body: true, expected: true},
    {name: 'unlinked', status: 200, body: false, expected: false},
    {name: 'no search result', status: 200, body: false, expected: false},
    {name: 'upstream not found', status: 404, body: undefined, expected: false},
    {name: 'provider failure', status: 500, body: undefined, expected: undefined},
  ])('handles defendant link status: $name', async example => {
    provider.addInteraction({states: [{description: `Defendant link status is ${example.name}`}], uponReceiving: `a defendant link lookup returning ${example.name}`,
      withRequest: {method: 'GET', path: `/assignment/reference/${REFERENCE}/defendant-link-status`, headers: {'Content-Type': 'application/json'}},
      willRespondWith: {status: example.status, ...(example.status === 200 ? {headers: {'Content-Type': 'application/json'}, body: example.body} : {})}});
    await exercise(async client => {
      const result = client.isDefendantLinked(REFERENCE);
      if (example.status === 500) {
        await expect(result).rejects.toMatchObject({isAxiosError: true, response: {status: 500}});
      } else {
        await expect(result).resolves.toBe(example.expected);
      }
    });
  });

  test.each([{name: 'accepted', status: 200}, {name: 'rejected PIN', status: 400}])('assigns a defendant: $name', async example => {
    provider.addInteraction({states: [{description: `Defendant assignment is ${example.name}`}], uponReceiving: `an authenticated defendant assignment with ${example.name}`,
      withRequest: {method: 'POST', path: `/assignment/case/${CASE_ID}/DEFENDANT`, headers: {...auth, 'Content-Type': 'application/json'}, body: {pin: PIN}},
      willRespondWith: {status: example.status}});
    await exercise(async client => {
      const result = client.assignDefendantToClaim(CASE_ID, request(), PIN);
      if (example.status === 200) {
        await expect(result).resolves.toBeUndefined();
      } else {
        await expect(result).rejects.toMatchObject({isAxiosError: true, response: {status: 400}});
      }
    });
  });
});
