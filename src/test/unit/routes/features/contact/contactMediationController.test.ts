import request from 'supertest';
import { app } from '../../../../../main/app';
import { CONTACT_MEDIATION_URL } from 'routes/urls';
import config from 'config';
import nock from 'nock';

jest.mock('../../../../../main/modules/oidc');

describe('Contact Mediation page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should display Contact Mediation page', async () => {
      const res = await request(app).get(CONTACT_MEDIATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Small Claims Mediation Service');
    });
  });
});
