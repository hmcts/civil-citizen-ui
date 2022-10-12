import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIM_RESOLVING_DISPUTE_URL,
} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');

describe('Resolving Dispute', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving dispute page', async () => {
      await request(app)
        .get(CLAIM_RESOLVING_DISPUTE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Try to resolve the dispute');
        });
    });
  });
});
