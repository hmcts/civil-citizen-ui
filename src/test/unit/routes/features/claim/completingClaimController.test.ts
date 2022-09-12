import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIM_COMPLETING_CLAIM_URL,
} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');

describe('Completing Claim', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return completing claim page', async () => {
      await request(app)
        .get(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Get the details right');
        });
    });
  });
});
