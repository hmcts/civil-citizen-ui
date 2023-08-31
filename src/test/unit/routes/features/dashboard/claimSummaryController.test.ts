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
import {CaseRole} from 'form/models/caseRoles';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const isCaseProgressionV1EnableMock = isCaseProgressionV1Enable as jest.Mock;
const getLatestUpdateContentMock = getLatestUpdateContent as jest.Mock;

jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/dashboard/claimSummary/latestUpdateService');
jest.mock('services/features/dashboard/claimSummaryService');
jest.mock('services/caseDocuments/documentService');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('Claim Summary Controller Defendant', () => {
  const civilServiceUrl = config.get<string>('services.civilService.url');
  beforeAll((done) => {
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
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
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
          expect(res.text).not.toContain('Upload documents');
          expect(res.text).toContain(t(TabLabel.LATEST_UPDATE));
          expect(res.text).not.toContain(t(TabLabel.NOTICES));
          expect(res.text).not.toContain('Read and save all documents uploaded by the parties involved in the claim. Three weeks before the trial, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
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
          ...claim.case_data,
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
        });
    });
  });
});
