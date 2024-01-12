import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {ClaimSummaryContent, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CaseRole} from 'form/models/caseRoles';
import {getLatestUpdateContentForClaimant} from 'services/features/dashboard/claimSummary/latestUpdateService';
import { CaseState } from 'common/form/models/claimDetails';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const getLatestUpdateContentForClaimantMock = getLatestUpdateContentForClaimant as jest.Mock;

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

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('Claim Summary Controller Claimant', () => {
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
  const mockClaimSummaryContent: ClaimSummaryContent = {
    contentSections: [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: 'Test Title',
        },
      },
    ],
  };

  const data = {
    ...claim,
    state: CaseState.AWAITING_APPLICANT_INTENTION,
  };

  describe('on GET', () => {

    it('should show latest Update claimant', async () => {
      //given
      getLatestUpdateContentForClaimantMock.mockReturnValue(mockClaimSummaryContent);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200,data);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //then
      await testSession
        .get(`/dashboard/${claimId}/claimant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
        });
    });
  });
});