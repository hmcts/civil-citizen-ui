import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseState} from 'form/models/claimDetails';

import {ClaimSummaryContent, ClaimSummaryType} from 'form/models/claimSummarySection';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {getCaseProgressionHearingMock} from '../../../../utils/caseProgression/mockCaseProgressionHearing';
import {TabId, TabLabel} from 'routes/tabs';
import {t} from 'i18next';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {CCDBundle} from 'models/caseProgression/bundles/ccdBundle';
import {CaseRole} from 'form/models/caseRoles';
import {isCarmApplicableAndSmallClaim} from 'common/utils/carmToggleUtils';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {Dashboard} from 'models/dashboard/dashboard';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { ApplicationResponse } from 'common/models/generalApplication/applicationResponse';
import { CivilServiceClient } from 'client/civilServiceClient';
import { GaServiceClient } from 'client/gaServiceClient';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {APPLICATION_TYPE_URL, GA_APPLICATION_RESPONSE_SUMMARY_URL} from 'routes/urls';
import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { getContactCourtLink } from 'services/dashboard/dashboardService';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const claimSummaryService = require('services/features/dashboard/claimSummaryService');
const getDocumentsContentMock = claimSummaryService.getDocumentsContent as jest.Mock;
const getEvidenceUploadContentMock = claimSummaryService.getEvidenceUploadContent as jest.Mock;
const getLatestUpdateContentMock = getLatestUpdateContent as jest.Mock;
const isCarmApplicableAndSmallClaimMock = isCarmApplicableAndSmallClaim as jest.Mock;
const isCarmEnabledForCaseMock = launchDarklyClient.isCarmEnabledForCase as jest.Mock;
const isCUIReleaseTwoEnabledMock = launchDarklyClient.isCUIReleaseTwoEnabled as jest.Mock;
const isDashboardEnabledForCase = launchDarklyClient.isDashboardEnabledForCase as jest.Mock;
const isGAForLiPEnabledMock = launchDarklyClient.isGaForLipsEnabled as jest.Mock;
const isWelshEnabledForMainCaseMock = launchDarklyClient.isWelshEnabledForMainCase as jest.Mock;

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
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/dashboard/claimSummary/latestUpdateService');
jest.mock('services/features/dashboard/claimSummaryService');
jest.mock('services/caseDocuments/documentService');
jest.mock('services/features/caseProgression/bundles/bundlesService');
jest.mock('common/utils/carmToggleUtils.ts');

jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(()=>dashboard),
  getHelpSupportTitle: jest.fn(),
  getHelpSupportLinks: jest.fn(),
  extractOrderDocumentIdFromNotification : jest.fn(),
  getContactCourtLink: jest.fn(()=> ({text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT')})),
}));

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;
describe('Claim Summary Controller Defendant', () => {
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamUrl: string = config.get('idamUrl');

  beforeAll((done) => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    testSession
      .get('/oauth2/callback')
      .query('code=ABC')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const claimWithSdo = {
    ...claim,
    state: CaseState.AWAITING_APPLICANT_INTENTION,
    case_data: {
      ...claim.case_data,
    },
  };
  const mockClaimSummaryContent: ClaimSummaryContent = {
    contentSections: [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: 'Test Title',
        },
      },
    ],
    hasDivider: true,
  };

  describe('on GET', () => {
    beforeEach(() => {
      getDocumentsContentMock.mockResolvedValue([{
        contentSections: [{
          type: ClaimSummaryType.TITLE,
          data: {text: 'Mock notices tab'},
        }],
        hasDivider: false,
      }]);
      getEvidenceUploadContentMock.mockReturnValue([{
        contentSections: [{
          type: ClaimSummaryType.TITLE,
          data: {text: 'Mock evidence tab'},
        }],
        hasDivider: false,
      }]);
    });

    it('should return evidence upload content when case progression documents exist', async () => {
      //given
      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mock evidence tab');
        });
    });

    it('should not return evidence upload content when flag is enabled and no hasSDODocument', async () => {
      //given
      getLatestUpdateContentMock.mockReturnValue([]);

      const claimWithoutSDO = JSON.parse(JSON.stringify(claim));
      claimWithoutSDO.case_data.systemGeneratedCaseDocuments = [{
        'id': '9e632049-ff29-44a0-bdb7-d71ec1d42e2d',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'document_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
            'document_filename': 'sealed_claim_form_000MC001.pdf',
            'document_binary_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
          },
          'documentName': 'sealed_claim_form_000MC001.pdf',
          'documentSize': 45794,
          'documentType': 'SEALED_CLAIM',
          'createdDatetime': '2022-06-21T14:15:19',
        },
      }];

      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithoutSDO);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Mock evidence tab');
          expect(res.text).toContain(TabId.LATEST_UPDATE);
          expect(res.text).not.toContain(TabId.NOTICES);
        });
    });

    it('should not return evidence upload content when flag is enabled and hasSDODocument but latestUpdateContent not empty', async () => {
      //given
      getLatestUpdateContentMock.mockReturnValue(mockClaimSummaryContent);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mock evidence tab');
          expect(res.text).toContain(t(TabLabel.UPDATES));
          expect(res.text).toContain(t(TabLabel.NOTICES));
          expect(res.text).not.toContain('A hearing has been scheduled for your case');
        });
    });

    it('should show case progression hearing latest Update', async () => {
      //given
      const caseProgressionHearing = getCaseProgressionHearingMock();

      const claimWithHeringDocs = {
        ...claim,
        state: CaseState.AWAITING_APPLICANT_INTENTION,
        case_data: {
          ...claimWithSdo.case_data,
          hearingDate: caseProgressionHearing.hearingDate,
          hearingLocation: caseProgressionHearing.hearingLocation,
          hearingTimeHourMinute: caseProgressionHearing.hearingTimeHourMinute,
          hearingDocuments: caseProgressionHearing.hearingDocuments,
        },
      };

      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithHeringDocs);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mock evidence tab');
          expect(res.text).not.toContain(t(TabLabel.LATEST_UPDATE));
          expect(res.text).toContain(t(TabLabel.UPDATES));
          expect(res.text).toContain(t(TabLabel.NOTICES));
          expect(res.text).toContain('A hearing has been scheduled for your case');
          expect(res.text).not.toContain(TabId.BUNDLES);
        });
    });

    it('should show case progression Trial bundle', async () => {
      //given
      const caseProgressionHearing = getCaseProgressionHearingMock();

      const bundles = [] as CCDBundle[];
      bundles.push(new CCDBundle('1234', new Bundle('document', {document_url: 'url',document_filename: 'name', document_binary_url: 'binaryurl'}, new Date('01-01-2023'), new Date('01-01-2023'))));

      const claimWithHearingAndBundleDocs = {
        ...claim,
        state: CaseState.AWAITING_APPLICANT_INTENTION,
        case_data: {
          ...claimWithSdo.case_data,
          hearingDate: caseProgressionHearing.hearingDate,
          hearingLocation: caseProgressionHearing.hearingLocation,
          hearingTimeHourMinute: caseProgressionHearing.hearingTimeHourMinute,
          hearingDocuments: caseProgressionHearing.hearingDocuments,
          caseBundles: bundles,
        },
      };

      getLatestUpdateContentMock.mockReturnValue([]);

      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithHearingAndBundleDocs);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mock evidence tab');
          expect(res.text).not.toContain(t(TabLabel.LATEST_UPDATE));
          expect(res.text).toContain(t(TabLabel.UPDATES));
          expect(res.text).toContain(t(TabLabel.NOTICES));
          expect(res.text).toContain('A hearing has been scheduled for your case');
          expect(res.text).toContain(TabId.BUNDLES);
        });
    });

    it('should show case dismissed latest Update defendant', async () => {
      //given
      const caseProgressionHearing = getCaseProgressionHearingMock();

      const claimWithHeringDocs = {
        ...claim,
        state: CaseState.AWAITING_APPLICANT_INTENTION,
        case_data: {
          ...claim.case_data,
          caseDismissedHearingFeeDueDate: new Date(Date.now()),
          hearingDate: caseProgressionHearing.hearingDate,
          hearingLocation: caseProgressionHearing.hearingLocation,
          hearingTimeHourMinute: caseProgressionHearing.hearingTimeHourMinute,
          hearingDocuments: caseProgressionHearing.hearingDocuments,
        },
      };

      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithHeringDocs);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('This claim has been struck out because the claimant has not paid the hearing fee as instructed in the hearing notice');
        });
    });

    it('should new dashboard when carm is on and claim is small', async () => {
      //given
      const smallClaim = {
        ...claim,
        state: CaseState.AWAITING_APPLICANT_INTENTION,
        case_data: {
          ...claim.case_data,
        },
      };
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isDashboardEnabledForCase.mockResolvedValue(true);
      isCarmApplicableAndSmallClaimMock.mockReturnValue(true);
      isCarmEnabledForCaseMock.mockResolvedValue(true);
      jest.spyOn(draftStoreService, 'updateFieldDraftClaimFromStore');
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, smallClaim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Case number: ');
        });
    });
    it('should new dashboard when we have hearing task list', async () => {
      //given
      const smallClaim = {
        ...claim,
        state: CaseState.AWAITING_APPLICANT_INTENTION,
        case_data: {
          ...claim.case_data,
        },
      };
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isDashboardEnabledForCase.mockResolvedValue(true);
      isCarmApplicableAndSmallClaimMock.mockReturnValue(true);
      isCarmEnabledForCaseMock.mockResolvedValue(true);
      jest.spyOn(draftStoreService, 'updateFieldDraftClaimFromStore');
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, smallClaim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Case number: ');
        });
    });

    it('should I want to link with case moved to caseman', async () => {
      //given
      const caseProgressionHearing = getCaseProgressionHearingMock();
      const claimWithHeringDocs = {
        ...claim,
        state: CaseState.PROCEEDS_IN_HERITAGE_SYSTEM,
        case_data: {
          ...claimWithSdo.case_data,
          hearingDate: caseProgressionHearing.hearingDate,
          hearingLocation: caseProgressionHearing.hearingLocation,
          hearingTimeHourMinute: caseProgressionHearing.hearingTimeHourMinute,
          hearingDocuments: caseProgressionHearing.hearingDocuments,
          takenOfflineDate: new Date(),
        },
      };

      isDashboardEnabledForCase.mockResolvedValue(true);
      getLatestUpdateContentMock.mockReturnValue([]);
      jest.spyOn(draftStoreService, 'updateFieldDraftClaimFromStore');
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithHeringDocs);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.DEFENDANT]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Contact the court to request a change to my case (make an application)');
        });
    });

    it('should show \'want to\' link with linking to general application when general application is enabled', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      claim.ccdState = CaseState.CASE_ISSUED;
      const applicationResponse: ApplicationResponse = {
        case_data: {
          applicationTypes: undefined,
          generalAppType: undefined,
          generalAppRespondentAgreement: undefined,
          generalAppInformOtherParty: {
            isWithNotice: YesNoUpperCamelCase.NO,
            reasonsForWithoutNotice: 'Reason without notice',
          },
          generalAppAskForCosts: undefined,
          generalAppDetailsOfOrder: undefined,
          generalAppReasonsOfOrder: undefined,
          generalAppEvidenceDocument: undefined,
          gaAddlDoc: undefined,
          generalAppHearingDetails: undefined,
          generalAppStatementOfTruth: undefined,
          generalAppPBADetails: undefined,
          applicationFeeAmountInPence: undefined,
          parentClaimantIsApplicant: YesNoUpperCamelCase.NO,
          judicialDecision: undefined,
        },
        created_date: '',
        id: '123456',
        last_modified: '',
        state: undefined,
      };

      const applicationResponses : ApplicationResponse[] = [applicationResponse];
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest
        .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce(applicationResponses);
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isGAForLiPEnabledMock.mockResolvedValue(true);
      isDashboardEnabledForCase.mockResolvedValue(true);
      jest.spyOn(draftStoreService, 'updateFieldDraftClaimFromStore');

      const getContactCourtLinkMock = getContactCourtLink as jest.Mock;
      getContactCourtLinkMock.mockImplementation(() => {
        return {
          text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT'),
          url: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL),
        };
      });
      await testSession.get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT'));
          expect(res.text).toContain(constructResponseUrlWithIdParams(`${claimId}`, APPLICATION_TYPE_URL));
          expect(res.text).toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.VIEW_ALL_APPLICATIONS'));
          expect(res.text).toContain(constructResponseUrlWithIdParams(`${claimId}`, GA_APPLICATION_RESPONSE_SUMMARY_URL));
        });
    });

    it('should not show view all application link when general application is enabled but there is no application', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      claim.ccdState = CaseState.CASE_ISSUED;
      const applicationResponses : ApplicationResponse[] = [];
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      jest
        .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce(applicationResponses);
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isGAForLiPEnabledMock.mockResolvedValue(true);
      isDashboardEnabledForCase.mockResolvedValue(true);
      jest.spyOn(draftStoreService, 'updateFieldDraftClaimFromStore');

      await testSession.get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain(t('PAGES.DASHBOARD.SUPPORT_LINKS.VIEW_ALL_APPLICATIONS'));
          expect(res.text).not.toContain(constructResponseUrlWithIdParams(`${claimId}`, GA_APPLICATION_RESPONSE_SUMMARY_URL));
        });
    });

    const testCases = [
      { caseRole: CaseRole.DEFENDANT, ccdState: CaseState.CASE_PROGRESSION },
      { caseRole: CaseRole.DEFENDANT, ccdState: CaseState.HEARING_READINESS },
      { caseRole: CaseRole.DEFENDANT, ccdState: CaseState.PREPARE_FOR_HEARING_CONDUCT_HEARING },
      { caseRole: CaseRole.DEFENDANT, ccdState: CaseState.DECISION_OUTCOME },
      { caseRole: CaseRole.DEFENDANT, ccdState: CaseState.All_FINAL_ORDERS_ISSUED },
    ];

    describe.each(testCases)('Query management dashboard links', (testCase) => {
      it(`should display updated contact us information for case role: ${testCase.caseRole} with state: ${testCase.ccdState}`, async () => {
        jest.spyOn(launchDarkly, 'isQueryManagementEnabled').mockResolvedValue(true);
        isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
        isGAForLiPEnabledMock.mockResolvedValue(true);
        isDashboardEnabledForCase.mockResolvedValue(true);
        const claim = new Claim();
        claim.caseRole = testCase.caseRole;
        claim.ccdState = testCase.ccdState;
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockResolvedValueOnce(claim);
        jest
          .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
          .mockResolvedValueOnce([]);
        app.locals = {
          showCreateQuery : true,
          isQMFlagEnabled : true,
          disableSendMessage : true,
        };

        await testSession
          .get(`/dashboard/${claimId}/defendant`).expect((res: Response) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('COMMON.CONTACT_US_FOR_HELP.COURT_STAFF_DISCLOSURE'));
            expect(res.text).toContain(t('COMMON.CONTACT_US_FOR_HELP.SEND_MESSAGE'));
            expect(res.text).toContain(t('COMMON.CONTACT_US_FOR_HELP.SEND_MESSAGE_LINK'));
            expect(res.text).toContain(t('COMMON.CONTACT_US_FOR_HELP.SEND_MESSAGE_RESPONSE'));
            expect(res.text).toContain(t('COMMON.CONTACT_US_FOR_HELP.TELEPHONE'));
          });
      });
    });

    it('should show welsh party banner', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.ccdState = CaseState.CASE_ISSUED;
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isGAForLiPEnabledMock.mockResolvedValue(false);
      isWelshEnabledForMainCaseMock.mockResolvedValue(true);

      await testSession
        .get(`/dashboard/${claimId}/defendant`).expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('BANNERS.WELSH_PARTY.MESSAGE'));
        });
    });

    it('should not show welsh party banner if Welsh feature disabled', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.ccdState = CaseState.CASE_ISSUED;
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isGAForLiPEnabledMock.mockResolvedValue(false);
      isWelshEnabledForMainCaseMock.mockResolvedValue(false);

      await testSession
        .get(`/dashboard/${claimId}/defendant`).expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain(t('BANNERS.WELSH_PARTY.MESSAGE'));
        });
    });
  });
});
