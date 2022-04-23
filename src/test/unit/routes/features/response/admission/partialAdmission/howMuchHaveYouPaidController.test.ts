import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {CITIZEN_AMOUNT_YOU_PAID_URL, CLAIM_TASK_LIST_URL} from '../../../../../../../main/routes/urls';
import {Logger} from 'winston';
import {
  setHowMuchHaveYouPaidControllerLogger,
} from '../../../../../../../main/routes/features/response/admission/partialAdmission/howMuchHaveYouPaidController';
import {
  ENTER_PAYMENT_EXPLANATION,
  VALID_AMOUNT,
  VALID_DATE_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_YEAR,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {mockCivilClaim, mockCivilClaimUndefined, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';


jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');


const mockDraftStore = {
  get: jest.fn(() => Promise.resolve('{"id": "id", "case_data": {"statementOfMeans": {}}}')),
  set: jest.fn(() => Promise.resolve()),
};

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as Logger;


describe('How Much Have You Paid', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    setHowMuchHaveYouPaidControllerLogger(mockLogger);
  });

  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
          expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    test('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({ amount: 50, totalClaimAmount: 110, year: '2022', month: '1', day: '31', text: 'text' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
          expect(mockLogger.error).toHaveBeenCalled();
        });
    });
  });

  describe('on GET', () => {
    test('should return how much have you paid page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid the claimant?');
        });
    });
    test('should return how much have you paid with payment amount loaded from Redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid the claimant?');
          expect(res.text).toContain('name="amount" type="number" spellcheck="false" value="20"');
          expect(res.text).toContain('name="year" type="text" value="2022" pattern="[0-9]*');
          expect(res.text).toContain('name="month" type="text" value="1" pattern="[0-9]*');
          expect(res.text).toContain('name="day" type="text" value="1" pattern="[0-9]*');
        });
    });
  });
  describe('on POST', () => {
    test('should create a new claim if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({ amount: 50, totalClaimAmount: 110, year: '2022', month: '1', day: '31', text: 'text' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    test('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({ amount: undefined, totalClaimAmount: undefined, year: undefined, month: undefined, day: undefined, text: undefined })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_AMOUNT);
          expect(res.text).toContain(VALID_DAY);
          expect(res.text).toContain(VALID_MONTH);
          expect(res.text).toContain(VALID_YEAR);
          expect(res.text).toContain(ENTER_PAYMENT_EXPLANATION);
        });
    });
    test('should return error on date in future', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({ amount: 20, totalClaimAmount: 110, year: '2040', month: '1', day: '1', text: 'text' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_DATE_IN_PAST);
        });
    });
    test('should return error for a 2 digit year', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({ amount: 20, totalClaimAmount: 110, year: '22', month: '1', day: '1', text: 'text' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_FOUR_DIGIT_YEAR);
        });
    });
    test('should redirect to claim task list page on valid amount, date in past, text', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({ amount: 20, totalClaimAmount: 110, year: '2022', month: '1', day: '1', text: 'text' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TASK_LIST_URL}`);
        });
    });
  });
});
