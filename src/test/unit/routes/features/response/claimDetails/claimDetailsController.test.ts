import { app } from '../../../../../../main/app';
import {CLAIM_DETAILS_URL} from '../../../../../../main/routes/urls';
import config from 'config';
import request from 'supertest';
const nock = require('nock');
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    test('should return your claim details page', async () => {
      await request(app)
        .get(CLAIM_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim details');
        });
    });
  });
});
