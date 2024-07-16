import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
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
import {CaseState} from 'common/form/models/claimDetails';
import {t} from 'i18next';
import * as UtilityService from 'modules/utilityService';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {Dashboard} from 'models/dashboard/dashboard';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const isCarmEnabledForCaseMock = launchDarkly.isCarmEnabledForCase as jest.Mock;

const mockExpectedDashboardInfo=
  [{
    'categoryEn': 'Hearing',
    'categoryCy': 'Hearing Welsh',
    tasks: [{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }, {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }],
  },
  {
    'categoryEn': 'Hearing',
    'categoryCy': 'Hearing Welsh',
    tasks: [{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }, {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }],
  },
  {
    'categoryEn': 'Claim',
    'categoryCy': 'Claim Welsh',
    tasks:[{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'task_name_en2',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    },
    {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'task_name_en2',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    },
    {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'Hearings Upload hearing documents',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    }] as DashboardTask[],
  }] as DashboardTaskList[];
const dashboard = new Dashboard(mockExpectedDashboardInfo);

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(()=>dashboard),
  getHelpSupportTitle: jest.fn(()=>t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT')),
  getHelpSupportLinks: jest.fn(()=>HELP_SUPPORT_LINKS),
  extractOrderDocumentIdFromNotification: jest.fn(),
}));
jest.mock('common/utils/carmToggleUtils');

const HELP_SUPPORT_LINKS = [
  { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES'), url: 'test' },
  { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION'), url: 'test' },
  { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING'), url: 'test' },
  { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF'), url: 'test' },
  { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE'), url: 'test' },
  { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT'), url: 'test' },
];

const testCases = [
  { caseRole: CaseRole.CLAIMANT, ccdState: CaseState.CASE_PROGRESSION },
  { caseRole: CaseRole.CLAIMANT, ccdState: CaseState.HEARING_READINESS },
  { caseRole: CaseRole.CLAIMANT, ccdState: CaseState.PREPARE_FOR_HEARING_CONDUCT_HEARING },
  { caseRole: CaseRole.CLAIMANT, ccdState: CaseState.DECISION_OUTCOME },
  { caseRole: CaseRole.CLAIMANT, ccdState: CaseState.All_FINAL_ORDERS_ISSUED },
];

describe('claimant Dashboard Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return claimant dashboard page when only draft', async () => {

      jest.spyOn(UtilityService, 'getClaimById').mockReturnValueOnce(Promise.resolve(new Claim()));
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      await request(app).get(DASHBOARD_CLAIMANT_URL.replace(':id', 'draft')).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).not.toContain('Mr. Jan Clark v Version 1');
        expect(res.text).not.toContain('Case number: ');
      });
    });
    it('should return old claimant dashboard page', async () => {

      jest.spyOn(UtilityService, 'getClaimById').mockReturnValueOnce(Promise.resolve(new Claim()));
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(false);

      await request(app).get(DASHBOARD_CLAIMANT_URL.replace(':id', 'draft')).expect((res) => {
        expect(res.status).toBe(302);
      });
    });
    it('should return claimant dashboard page with claimant and fast Track', async () => {

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

      const data = Object.assign(claim, civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(data);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
      });
    });
    it('should return defendant dashboard page with claimant and small claims', async () => {

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
      const data = Object.assign(claim, civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(data);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
        expect(res.text).toContain('Case number: ');
      });
    });

    it('should return defendant dashboard page with claimant and small claims with task list info', async () => {

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
      const data = Object.assign(claim, civilClaimResponseMock.case_data);

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(data);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
        expect(res.text).toContain('Case number: ');
      });
    });

    it('should return defendant dashboard page with claimant and small claims when carm is on', async () => {

      isCarmEnabledForCaseMock.mockResolvedValue(true);
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
      const data = Object.assign(claim, civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(data);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
      });
    });
    it('should return defendant dashboard page with defendant and fast track', async () => {

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

      const data = Object.assign(claim, civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(data);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
      });
    });
    it('should return defendant dashboard page with defendant and small claims', async () => {

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

      const data = Object.assign(claim, civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(data);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
      });
    });

    it('should show support links for claimant', async () => {

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT'));
        expect(res.text).toContain('Tell us you&#39;ve ended the claim');
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.GET_DEBT_RESPITE'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT'));
      });
    });

    describe.each(testCases)('Dashboard Support Links Test', (testCase) => {
      it(`should show support links for claimant with caseRole: ${testCase.caseRole} and ccdState: ${testCase.ccdState}`, async () => {

        const claim = new Claim();
        claim.caseRole = testCase.caseRole;
        claim.ccdState = testCase.ccdState;
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockResolvedValueOnce(claim);
        jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
        jest.spyOn(launchDarkly, 'isCaseProgressionV1Enable').mockResolvedValueOnce(true);

        await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.GET_DEBT_RESPITE'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE'));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT'));
        });
      });
    });
    it('should show support links for claimant whit links hidden', async () => {

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.ccdState = CaseState.CASE_ISSUED;
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);

      await request(app).get(DASHBOARD_CLAIMANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).not.toContain('Tell us you&#39;ve ended the claim');
        expect(res.text).not.toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.GET_DEBT_RESPITE'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE'));
        expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app)
        .get(DASHBOARD_CLAIMANT_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

});
