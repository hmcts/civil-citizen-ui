import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {DASHBOARD_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const nock = require('nock');

describe('Dashboard page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    test('should return dashboard page in english', async () => {
      await request(app)
        .get(DASHBOARD_URL + '?lang=en')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });

    test('should return dashboard page in cymraeg', async () => {
      await request(app)
        .get(DASHBOARD_URL + '?lang=cy')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Smialc edam tsniaga uoy');
        });
    });
  });
});

