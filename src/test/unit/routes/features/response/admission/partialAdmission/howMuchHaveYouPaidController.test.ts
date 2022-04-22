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
  VALID_DATE_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
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
        .send('amount=50.00')
        .send('totalClaimAmount=100.00')
        .send('year=2022')
        .send('month=1')
        .send('day=31')
        .send('text=text')
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
    test('should return payment date page with payment date loaded from Redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid the claimant?');
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
        .send('amount=50')
        .send('totalClaimAmount=100')
        .send('year=2022')
        .send('month=1')
        .send('day=31')
        .send('text=text')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    test('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_DAY);
          expect(res.text).toContain(VALID_MONTH);
          expect(res.text).toContain(VALID_FOUR_DIGIT_YEAR);
        });
    });
    test('should return error on date in the past', async () => {
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send('year=1999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_DATE_IN_PAST);
        });
    });
    test('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_FOUR_DIGIT_YEAR);
        });
    });
    test('should accept a future date', async () => {
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should redirect to claim task list page on valid payment date', async () => {
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TASK_LIST_URL}`);
        });
    });
  });
});
