import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {PartyType} from 'common/models/partyType';
import {PartyDetails} from 'common/form/models/partyDetails';
import {Party} from 'common/models/party';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {PaymentDetails, PaymentStatus} from 'models/PaymentDetails';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import * as UtilityService from 'modules/utilityService';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(),
  extractOrderDocumentIdFromNotification: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('claimant Dashboard Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return claimant dashboard page when only draft and isCUIReleaseTwoEnabled', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = new PartyDetails({
        individualTitle:'Mr',
        individualFirstName:'Jon',
        individualLastName:'Doe',
      });
      claim.totalClaimAmount=12000;
      claim.caseRole = CaseRole.CLAIMANT;
      claim.applicant1Represented = YesNoUpperCamelCase.NO;
      claim.caseProgressionHearing = new CaseProgressionHearing( null, null, null, null, null, null, new PaymentDetails('123', 'cu123', PaymentStatus.SUCCESS) );
      claim.caseProgression = new CaseProgression();
      jest.spyOn(UtilityService, 'getClaimById').mockReturnValueOnce(Promise.resolve(new Claim()));
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      await request(app).get(OLD_DASHBOARD_CLAIMANT_URL.replace(':id', 'draft')).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).not.toContain('Found. Redirecting to /dashboard/:id/claimantNewDesign');
      });
    });
    it('should return claimant dashboard page with claimant and fast Track and isCUIReleaseTwoEnabled', async () => {

      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = new PartyDetails({
        individualTitle:'Mr',
        individualFirstName:'Jon',
        individualLastName:'Doe',
      });
      claim.totalClaimAmount=12000;
      claim.caseRole = CaseRole.CLAIMANT;
      claim.applicant1Represented = YesNoUpperCamelCase.NO;
      claim.caseProgressionHearing = new CaseProgressionHearing( null, null, null, null, null, null, new PaymentDetails('123', 'cu123', PaymentStatus.SUCCESS) );
      claim.caseProgression = new CaseProgression();

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(OLD_DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain('Found. Redirecting to /dashboard/:id/claimantNewDesign');
      });
    });
    it('should return defendant dashboard page with claimant and small claims and isCUIReleaseTwoEnabled', async () => {

      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = new PartyDetails({
        individualTitle:'Mr',
        individualFirstName:'Jon',
        individualLastName:'Doe',
      });
      claim.totalClaimAmount=500;
      claim.caseRole = CaseRole.CLAIMANT;
      claim.caseProgression = new CaseProgression();

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(OLD_DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain('Found. Redirecting to /dashboard/:id/claimantNewDesign');
      });
    });
    it('should return defendant dashboard page with defendant and fast track and isCUIReleaseTwoEnabled', async () => {

      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = new PartyDetails({
        individualTitle:'Mr',
        individualFirstName:'Jon',
        individualLastName:'Doe',
      });
      claim.totalClaimAmount=12000;
      claim.caseRole = CaseRole.DEFENDANT;
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      claim.caseProgression = new CaseProgression();

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(OLD_DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain('Found. Redirecting to /dashboard/:id/claimantNewDesign');
      });
    });
    it('should return defendant dashboard page with defendant and small claims and isCUIReleaseTwoEnabled', async () => {

      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.respondent1.partyDetails = new PartyDetails({
        individualTitle:'Mr',
        individualFirstName:'Jon',
        individualLastName:'Doe',
      });
      claim.totalClaimAmount=500;
      claim.caseRole = CaseRole.DEFENDANT;
      claim.caseProgression = new CaseProgression();

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(OLD_DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain('Found. Redirecting to /dashboard/:id/claimantNewDesign');
      });
    });

    it('should return status 500 when error thrown and isCUIReleaseTwoEnabled', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app)
        .get(OLD_DASHBOARD_CLAIMANT_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should return status 500 when error thrown', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(false);
      await request(app)
        .get(OLD_DASHBOARD_CLAIMANT_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

});
