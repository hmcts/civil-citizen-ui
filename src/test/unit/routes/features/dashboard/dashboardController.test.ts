import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {DASHBOARD_URL} from '../../../../../main/routes/urls';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../main/app/client/civilServiceUrls';
import {mockClaimantClaims} from "../../../../utils/mockDraftStore";

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
const nock = require('nock');

const agent = request.agent(app);

const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);

jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('Dashboard page', () => {
  const idamUrl: string = config.get('idamUrl');
  const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
  const draftStoreUrl = config.get<string>('services.draftStore.legacy.url');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    authenticate();
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CASES_URL)
      .reply(200, {});
    nock('http://localhost:4000')
      .get(CIVIL_SERVICE_CASES_URL  + 'claimant/undefined')
      .reply(200, {});
  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});
  nock('http://localhost:4000')
    .post(CIVIL_SERVICE_CASES_URL)
    .reply(200, {});
  nock(serviceAuthProviderUrl)
    .post('/lease')
    .reply(200, {});
  nock(draftStoreUrl)
    .get('/drafts')
    .reply(200, {});

  beforeEach((done) => {
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
    test('should return dashboard page', async () => {
      // console.log(`authenticatedSession: ${authenticatedSession}`);
      console.log(JSON.stringify(testSession));
      await testSession
      app.locals.draftStoreClient = mockClaimantClaims;
      await agent
        .get(DASHBOARD_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims you&#39;ve made');
          expect(res.text).toContain('Claims made against you');
        });
    });
  });
});
