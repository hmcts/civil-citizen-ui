import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseState} from 'form/models/claimDetails';

import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimSummaryContent, ClaimSummaryType} from 'form/models/claimSummarySection';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {getCaseProgressionHearingMock} from '../../../../utils/caseProgression/mockCaseProgressionHearing';
import {TabId, TabLabel} from 'routes/tabs';
import {t} from 'i18next';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {CCDBundle} from 'models/caseProgression/bundles/ccdBundle';
import {CaseRole} from 'form/models/caseRoles';
import {isCarmApplicableAndSmallClaim, isCarmEnabledForCase} from 'common/utils/carmToggleUtils';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {Dashboard} from 'models/dashboard/dashboard';
import {CivilServiceClient} from 'client/civilServiceClient';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const isCaseProgressionV1EnableMock = isCaseProgressionV1Enable as jest.Mock;
const getLatestUpdateContentMock = getLatestUpdateContent as jest.Mock;
const isCarmApplicableAndSmallClaimMock = isCarmApplicableAndSmallClaim as jest.Mock;
const isCarmEnabledForCaseMock = isCarmEnabledForCase as jest.Mock;
const isDashboardServiceEnabledMock = launchDarklyClient.isDashboardServiceEnabled as jest.Mock;
const isCUIReleaseTwoEnabledMock = launchDarklyClient.isCUIReleaseTwoEnabled as jest.Mock;
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
      'taskNameEn': 'Upload hearing documents',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    }] as DashboardTask[],
  }] as DashboardTaskList[];
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/dashboard/claimSummary/latestUpdateService');
jest.mock('services/features/dashboard/claimSummaryService');
jest.mock('services/caseDocuments/documentService');
jest.mock('services/features/caseProgression/bundles/bundlesService');
jest.mock('common/utils/carmToggleUtils.ts');

jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(),
  getHelpSupportTitle: jest.fn(),
  getHelpSupportLinks: jest.fn(),
  extractOrderDocumentIdFromNotification : jest.fn(),
}));

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

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

    it('should not return evidence upload content when flag is disabled', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(false);
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
          expect(res.text).not.toContain('Upload documents');
          expect(res.text).not.toContain('Read and save all documents uploaded by the parties involved in the claim. Three weeks before the trial, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
        });
    });

    it('should not return evidence upload content when flag is enabled and no hasSDODocument', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
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
          expect(res.text).not.toContain('Upload documents');
          expect(res.text).toContain(TabId.LATEST_UPDATE);
          expect(res.text).not.toContain(TabId.NOTICES);
        });
    });

    it('should not return evidence upload content when flag is enabled and hasSDODocument but latestUpdateContent not empty', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
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
          expect(res.text).toContain('Upload documents');
          expect(res.text).toContain(t(TabLabel.UPDATES));
          expect(res.text).toContain(t(TabLabel.NOTICES));
          expect(res.text).not.toContain('A hearing has been scheduled for your case');
        });
    });

    it('should return status 500 when error thrown', async () => {
      //given
      isCaseProgressionV1EnableMock.mockRejectedValue(new Error('Mocked error'));
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
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
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

      isCaseProgressionV1EnableMock.mockResolvedValue(true);
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
          expect(res.text).toContain('Upload documents');
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

      isCaseProgressionV1EnableMock.mockResolvedValue(true);
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
          expect(res.text).toContain('Upload documents');
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

      isCaseProgressionV1EnableMock.mockResolvedValue(true);
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
      isDashboardServiceEnabledMock.mockResolvedValue(true);
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isCarmApplicableAndSmallClaimMock.mockReturnValue(true);
      isCarmEnabledForCaseMock.mockResolvedValue(true);
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
      isDashboardServiceEnabledMock.mockResolvedValue(true);
      isCUIReleaseTwoEnabledMock.mockResolvedValue(true);
      isCarmApplicableAndSmallClaimMock.mockReturnValue(true);
      isCarmEnabledForCaseMock.mockResolvedValue(true);
      const dashboard = new Dashboard(mockExpectedDashboardInfo);

      jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);
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
  });
});
