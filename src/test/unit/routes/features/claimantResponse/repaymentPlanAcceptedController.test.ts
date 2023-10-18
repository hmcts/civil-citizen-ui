import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL} from '../../../../../main/routes/urls';
import {app} from '../../../../../main/app';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true }),
  getRedisStoreForSession: jest.fn(),
}));
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
});
