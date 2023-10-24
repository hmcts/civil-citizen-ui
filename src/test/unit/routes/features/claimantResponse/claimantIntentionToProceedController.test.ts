import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true }),
  getRedisStoreForSession: jest.fn(),
}));

describe('Claimant intention to proceed Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return intention to proceed page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to proceed with claim?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      await request(app).post(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
      });
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to the claimant response task-list page if option no is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
