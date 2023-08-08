import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseState} from 'form/models/claimDetails';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {getCaseProgressionHearingMock} from '../../../../utils/caseProgression/mockCaseProgressionHearing';

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

  describe('on GET', () => {
    it('should show case progression hearing latest Update for claimant', async () => {
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
      //then
      await testSession
        .get(`/dashboard/${claimId}/claimant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim has been struck out');
          expect(res.text).toContain('Your claim has been struck out because you have not paid the hearing fee as instructed in the hearing notice');
        });
    });
  });
});
