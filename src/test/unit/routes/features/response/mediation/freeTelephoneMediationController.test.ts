import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Free Telephone Mediation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return free telephone mediation page successfully', async () => {
      await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Free telephone mediation');
      });
    });
  });
});
