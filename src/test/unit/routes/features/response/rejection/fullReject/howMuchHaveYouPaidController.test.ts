import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockNoStatementOfMeans,
  mockRedisFailure,
} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');

describe('How Much Have You Paid', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .send({amount: 50, totalClaimAmount: 110, year: '2022', month: '1', day: '31', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET', () => {
    it('should return how much have you paid page', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(mockNoStatementOfMeans);
      await request(app)
        .get(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid?');
        });
    });
    it('should return how much have you paid with payment amount loaded from Redis', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(mockCivilClaim);
      await request(app)
        .get(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid?');
          expect(res.text).toContain('name="amount" type="number" spellcheck="false" value="20"');
          expect(res.text).toContain('name="year" type="text" value="2022"');
          expect(res.text).toContain('name="month" type="text" value="1"');
          expect(res.text).toContain('name="day" type="text" value="1"');
        });
    });
  });
  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
      await request(app)
        .post(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .send({amount: 50, totalClaimAmount: 110, year: '2022', month: '1', day: '31', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return errors on no input', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(mockCivilClaim);
      await request(app)
        .post(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .send({
          amount: undefined,
          totalClaimAmount: undefined,
          year: undefined,
          month: undefined,
          day: undefined,
          text: undefined,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.ENTER_PAYMENT_EXPLANATION);
        });
    });
    it('should return error on date in future', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(mockCivilClaim);
      await request(app)
        .post(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .send({amount: 20, totalClaimAmount: 110, year: '2040', month: '1', day: '1', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DATE_IN_PAST);
        });
    });
    it('should return error for a 2 digit year', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(mockCivilClaim);
      await request(app)
        .post(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .send({amount: 20, totalClaimAmount: 110, year: '22', month: '1', day: '1', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
        });
    });
    it('should redirect to claim task list page on valid amount, date in past, text', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(mockCivilClaim);
      await request(app)
        .post(CITIZEN_FR_AMOUNT_YOU_PAID_URL)
        .send({amount: 20, totalClaimAmount: 110, year: '2022', month: '1', day: '1', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL}`);
        });
    });
  });
});
