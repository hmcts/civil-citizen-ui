import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {
  REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL,
} from 'routes/urls';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import Module from 'module';
import {CaseRole} from 'form/models/caseRoles';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import civilClaimResponseFastTrackMock from '../../../../../utils/mocks/civilClaimResponseFastTrackMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Request for reconsideration comments confirmation page test', () => {
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamUrl: string = config.get('idamUrl');

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});

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
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });

  describe('on GET', () => {
    it('should return expected page in English when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseFastTrackMock.case_data);
      });
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //When
      await testSession
        .get(REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL.replace(':id', claimId))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('A judge will now review the order and the comments.');
        });
    });

    it('should return expected page in Welsh when claim exists with Welsh cookie', async () => {
      //Given
      app.request.cookies = {lang: 'cy'};
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseFastTrackMock.case_data);
      });
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //When
      await testSession
        .get(REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL.replace(':id', claimId))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Bydd barnwr nawr yn adolygu’r gorchymyn a’r sylwadau.');
        });
    });

  });
});

