import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {t} from 'i18next';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import Module from 'module';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));

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

  describe('on GET', () => {
    it('should return expected page when claim exists', async () => {
      //Given
      app.locals.draftStoreClient = mockCivilClaim;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //When
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE'));
        });
    });

    it('should return "Something went wrong" page when claim does not exist', async () => {
      //Given
      app.locals.draftStoreClient = mockRedisFailure;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + '1111')
        .reply(404, null);
      //When
      await testSession
        .get(UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', '1111'))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

