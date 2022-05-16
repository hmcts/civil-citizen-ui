import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {DASHBOARD_URL} from '../../../../../../main/routes/urls';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../../main/app/client/civilServiceUrls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const nock = require('nock');

const agent = request.agent(app);

function authenticate() {
  agent.get('/oauth2/callback')
    .query('code=ABC')
    .then((res) => {
      expect(res.status).toBe(302);
    });
}

describe('Dashboard page', () => {
  const idamUrl: string = config.get('idamUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    authenticate();
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CASES_URL)
      .reply(200, {});
  });

  describe('on GET', () => {
    test('should return dashboard page in english', async () => {
      await agent
        .get(DASHBOARD_URL + '?lang=en')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });

    test('should return dashboard page in cymraeg', async () => {
      await agent
        .get(DASHBOARD_URL + '?lang=cy')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Smialc edam tsniaga uoy');
        });
    });
  });
});

