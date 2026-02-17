import request from 'supertest';
import nock from 'nock';
import config from 'config';
import { app } from '../../../../../main/app';
import { Claim } from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import { VIEW_CLAIMANT_INFO } from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {CaseRole} from 'form/models/caseRoles';
import {ClaimantResponse} from 'models/claimantResponse';
import {Mediation} from 'models/mediation/mediation';
import {Email} from 'models/Email';
import {PartyPhone} from 'models/PartyPhone';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/client/civilServiceClient');

describe('View Defendant Information', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const buildCaseData = (): Claim => Object.assign(new Claim(), claim.case_data) as Claim;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return contact claimant details from claim ', async () => {
    const caseData = buildCaseData();
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the claimant');
        expect(res.text).toContain('Phone:');
        expect(res.text).toContain('Contact us for help');
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.partyName);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine1);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine2);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine3);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.postCode);
      });
  });

  it('should use fallback claimant email and phone when applicant contact details are missing', async () => {
    const caseData = buildCaseData();
    caseData.applicant1.emailAddress = undefined;
    caseData.applicant1.partyPhone = undefined;
    caseData.claimantUserDetails = {email: 'fallback-claimant@test.com', id: 'id-1'};
    const claimantResponse = new ClaimantResponse();
    const mediation = new Mediation();
    mediation.canWeUse = {mediationPhoneNumber: '07000000000'};
    claimantResponse.mediation = mediation;
    caseData.claimantResponse = claimantResponse;

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('fallback-claimant@test.com');
        expect(res.text).toContain('07000000000');
      });
  });

  it('should not inject claimant email when fallback email is missing', async () => {
    const caseData = buildCaseData();
    caseData.applicant1.emailAddress = undefined;
    caseData.claimantUserDetails = undefined;

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).not.toContain('fallback-claimant@test.com');
      });
  });

  it('should keep existing claimant email and phone when already available', async () => {
    const caseData = buildCaseData();
    caseData.applicant1.emailAddress = new Email('existing-claimant@test.com');
    caseData.applicant1.partyPhone = new PartyPhone('07111111111');
    caseData.claimantUserDetails = {email: 'fallback-claimant@test.com', id: 'id-1'};
    const claimantResponse = new ClaimantResponse();
    const mediation = new Mediation();
    mediation.canWeUse = {mediationPhoneNumber: '07000000000'};
    claimantResponse.mediation = mediation;
    caseData.claimantResponse = claimantResponse;

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('existing-claimant@test.com');
        expect(res.text).toContain('07111111111');
        expect(res.text).not.toContain('fallback-claimant@test.com');
        expect(res.text).not.toContain('07000000000');
      });
  });

  it('should render defendant summary dashboard link for defendant role', async () => {
    const caseData = buildCaseData();
    caseData.caseRole = CaseRole.DEFENDANT;
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('/dashboard/:id/defendant');
      });
  });

  it('should return 500 when claim retrieval fails', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(new Error('failed'));
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
