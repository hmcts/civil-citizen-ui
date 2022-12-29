import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL,CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../../../../main/routes/urls';
import {app} from '../../../../../main/app';

describe('Claimant Response - Rejection reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return repayment plan accpted page', async () => {
      await request(app)
        .get(CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant-response task list page when clicking continue button', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });
  });
});
