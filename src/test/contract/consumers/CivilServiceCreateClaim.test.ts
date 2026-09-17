import { Matchers, Pact } from '@pact-foundation/pact';
import { CivilServiceClient } from '../../../main/app/client/civilServiceClient';
import { AppRequest } from '../../../main/common/models/AppRequest';
import { CaseEvent } from '../../../main/common/models/events/caseEvent';
import { PACT_DIRECTORY_PATH, PACT_LOG_PATH } from '../utils';
import {translateDraftClaimToCCDR2} from 'services/translation/claim/ccdTranslation';
import {draftClaim, draftVariants} from '../fixtures/draftClaim';
import draftRequest from '../fixtures/draftClaimRequest.json';
import {CallbackError} from 'client/common/error/callbackError';
import axios from 'axios';

const { like } = Matchers;
const CASE_ID = '1111222233334444';
const USER_ID = 'cui-user-id';
const ACCESS_TOKEN = 'some-access-token';
let providerPort = 9291;

const request = {
  session: { user: { id: USER_ID, accessToken: ACCESS_TOKEN, email: 'claimant@example.com' } },
  locals: { env: '', lang: '' },
  params: {},
} as unknown as AppRequest;

const createProvider = () => new Pact({
  consumer: 'civil_citizen_ui',
  provider: 'civil_service',
  host: '127.0.0.1',
  port: providerPort++,
  dir: PACT_DIRECTORY_PATH,
  log: PACT_LOG_PATH,
  logLevel: 'info',
});

describe('Civil Service create-claim contract', () => {
  let client: CivilServiceClient;
  let provider: Pact;

  beforeEach(async () => {
    provider = createProvider();
    await provider.setup();
    client = new CivilServiceClient(provider.mockService.baseUrl);
  });

  afterEach(async () => {
    await provider.verify();
    await provider.finalize();
  });

  test('looks up the claim issue fee fields consumed by CUI', async () => {
    await provider.addInteraction({
      state: 'A claim issue fee is available for a claim amount of 1000',
      uponReceiving: 'a request for the claim issue fee',
      withRequest: {
        method: 'GET', path: '/fees/claim/1000',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          calculatedAmountInPence: like('11500'),
          code: like('FEE0209'),
        },
      },
    });

    await expect(client.getClaimFeeData(1000, request)).resolves.toEqual({
      calculatedAmountInPence: 11500, code: 'FEE0209',
    });
  });

  test.each(draftVariants)('submits a translated $name draft and consumes the returned claim', async variant => {
    // Fixed wire examples are independent of the translator used by the real request.
    const expectedUpdates = {...draftRequest.common, ...draftRequest.variants[variant.name as keyof typeof draftRequest.variants]};
    await provider.addInteraction({
      state: `A draft ${variant.name} claim can be submitted`,
      uponReceiving: `a request to submit the ${variant.name} draft claim`,
      withRequest: {
        method: 'POST', path: `/cases/draft/citizen/${USER_ID}/event`,
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: { event: CaseEvent.CREATE_LIP_CLAIM, caseDataUpdate: expectedUpdates },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: like(Number(CASE_ID)),
          state: 'PENDING_CASE_ISSUED',
          last_modified: Matchers.term({generate: '2025-02-03T10:15:30', matcher: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'}),
          case_data: {
            legacyCaseReference: like('000MC001'),
            totalClaimAmount: like(1000),
            applicant1: {type: variant.applicant, partyName: like(variant.applicantName), primaryAddress: like(expectedUpdates.applicant1.primaryAddress)},
            respondent1: {type: variant.respondent, partyName: like(variant.respondentName), primaryAddress: like(expectedUpdates.respondent1.primaryAddress)},
            claimFee: {calculatedAmountInPence: like('11500'), code: like('FEE0209'), version: like('1')},
            claimantBilingualLanguagePreference: expectedUpdates.claimantBilingualLanguagePreference,
          },
        },
      },
    });

    const claim = await client.submitDraftClaim(translateDraftClaimToCCDR2(draftClaim(variant), request), request);
    expect(claim.id).toBe(CASE_ID);
    expect(claim.ccdState).toBe('PENDING_CASE_ISSUED');
    expect(claim.lastModifiedDate).toBe('2025-02-03T10:15:30');
    expect(claim.legacyCaseReference).toBe('000MC001');
    expect(claim.totalClaimAmount).toBe(1000);
    expect(claim.claimFee).toEqual({calculatedAmountInPence: '11500', code: 'FEE0209', version: '1'});
    expect(claim.applicant1.type).toBe(variant.applicant);
    expect(claim.applicant1.partyDetails.partyName).toBe(variant.applicantName);
    expect(claim.applicant1.partyDetails.primaryAddress.postCode).toBe('LS1 1AA');
    expect(claim.respondent1.type).toBe(variant.respondent);
    expect(claim.respondent1.partyDetails.partyName).toBe(variant.respondentName);
    expect(claim.respondent1.partyDetails.primaryAddress.postCode).toBe('LS1 1AA');
    expect(claim.claimantBilingualLanguagePreference).toBe(variant.language);
  });

  test.each([
    {name: 'callback errors and warnings', body: {callbackErrors: ['Claim cannot be submitted'], callbackWarnings: ['Check the claim details']}, messages: ['Claim cannot be submitted'], warnings: ['Check the claim details']},
    {name: 'field validation errors', body: {details: {field_errors: [{id: 'applicant1.partyEmail', message: 'Enter a valid email address'}]}}, messages: ['Enter a valid email address'], warnings: []},
    {name: 'no actionable validation fields', body: {message: 'Submission rejected'}, messages: [], warnings: []},
  ])('handles 422 with $name through the real response parser', async example => {
    await provider.addInteraction({
      state: `Citizen event submission returns ${example.name}`,
      uponReceiving: `a citizen event rejected with ${example.name}`,
      withRequest: {
        method: 'POST', path: `/cases/${CASE_ID}/citizen/${USER_ID}/event`,
        headers: {Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json'},
        body: {event: CaseEvent.CREATE_LIP_CLAIM, caseDataUpdate: {}},
      },
      willRespondWith: {status: 422, headers: {'Content-Type': 'application/json'}, body: example.body},
    });
    const result = client.submitEvent(CaseEvent.CREATE_LIP_CLAIM, CASE_ID, {}, request);
    if (example.messages.length) {
      await expect(result).rejects.toBeInstanceOf(CallbackError);
      await expect(result).rejects.toMatchObject({status: 422, message: example.messages[0], callbackErrors: example.messages, callbackWarnings: example.warnings});
    } else {
      const error = await result.catch(error => error);
      expect(axios.isAxiosError(error)).toBe(true);
      expect(error).not.toBeInstanceOf(CallbackError);
      expect(error.response.status).toBe(422);
      expect(error.response.data).toEqual(expect.objectContaining(example.body));
    }
  });
});
