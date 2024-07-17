import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import Module from 'module';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('"upload your documents" page test', () => {
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
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
    it('should return expected page when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //When
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId)).query({lang:'en'})
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Upload your documents');
          expect(res.text).toContain('Hearing');
        });
    });

    it('should return expected page when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //When
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId)).query({lang:'cy'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Uwchlwytho eich dogfennau');
          expect(res.text).toContain('Gwrandawiad');
        });
    });

    it('should return "Something went wrong" page when claim does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + '1111')
        .reply(404, null);
      //When
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', '1111')).query({lang:'en'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

