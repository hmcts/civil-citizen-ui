import config from 'config';
import {DASHBOARD_URL} from 'routes/urls';
const nock = require('nock');
const citizenRoleToken: string = config.get('citizenRoleToken');
import request from 'supertest';
import {app} from '../../../../../main/app';
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/user/oidc');
jest.mock('../../../../../main/services/features/dashboard/dashboardService', ()=>({
  getClaimsForDefendant: jest.fn(),
}));

describe('Dashboard page', () => {
  const idamUrl: string = config.get('idamUrl');

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});

  describe('on GET', () => {
    it('should return dashboard page', async () => {
      await  request(app)
        .get(DASHBOARD_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
  });
});
