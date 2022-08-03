import {app} from '../../../../../../main/app';
import config from 'config';
import Module from 'module';
import {DASHBOARD_URL} from '../../../../../../main/routes/urls';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../../utils/mocks/defendantClaimsMock.json');
jest.mock('../../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};

describe('Dashboard page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
  const draftStoreUrl = config.get<string>('services.draftStore.legacy.url');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    nock(serviceAuthProviderUrl)
      .post('/lease')
      .reply(200, {});
    nock(civilServiceUrl)
      .get('/cases/defendant/undefined')
      .reply(200, {data: data});
    nock(civilServiceUrl)
      .get('/cases/claimant/undefined')
      .reply(200, {data: data});
    nock(draftStoreUrl)
      .get('/drafts')
      .reply(200, {});
  });

  describe('on GET', () => {
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

    it('should return dashboard page in english', async () => {
      await testSession
        .get(DASHBOARD_URL + '?lang=en')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims you&#39;ve made');
          expect(res.text).toContain('Claims made against you');
        });
    });

    it('should return dashboard page in cymraeg', async () => {
      await testSession
        .get(DASHBOARD_URL + '?lang=cy')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Smialc edam tsniaga uoy');
        });
    });
  });
});

