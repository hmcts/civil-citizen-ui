import {app} from 'app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {TOTAL_AMOUNT_CALCULATION_URL} from 'routes/urls';

jest.mock('.modules/oidc');
jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

describe('Monthly income expense calculator controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on POST', () => {
    it('should calculate amount successfully', async () => {
      await request(app).post(TOTAL_AMOUNT_CALCULATION_URL)
        .send([{amount: '100', schedule: 'MONTH'}, {amount: '10', schedule: 'MONTH'}])
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('110');
        });
    });
  });
});
