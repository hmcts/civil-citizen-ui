import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import request from 'supertest';
import {
  CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../../../../main/routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from 'common/form/models/yesNo';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true }),
  getRedisStoreForSession: jest.fn(),
}));

describe('Accept Repayment Plan Page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return accept repayment plan page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.ACCEPT_REPAYMENT_PLAN.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to task list when yes is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)
        .send({
          option: YesNo.YES,
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to task list when no is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)
        .send({
          option: YesNo.NO,
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return error when no option selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)
        .send({
          option: undefined,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION'));
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
