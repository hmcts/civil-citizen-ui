import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import nock from 'nock';
import {DASHBOARD_URL} from '../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/oidc');

describe('Dashboard page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    it('should return dashboard page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claims made by or against you');
    });
  });
});
