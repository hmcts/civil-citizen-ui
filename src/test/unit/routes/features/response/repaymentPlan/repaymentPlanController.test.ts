import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CITIZEN_REPAYMENT_PLAN,
  CLAIM_TASK_LIST_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {
  PAYMENT_FREQUENCY_REQUIRED,
  EQUAL_INSTALMENTS_REQUIRED,
  AMOUNT_REQUIRED,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_YEAR,
  VALID_MONTH,
  VALID_DAY,
  FIRST_PAYMENT_DATE_IN_THE_FUTURE,
  FOUR_DIGIT_YEAR_REQUIRED,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Repayment Plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
});

describe('on Get', () => {
  test('should return on your repayment plan page successfully', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(CITIZEN_REPAYMENT_PLAN)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Your repayment plan');
      });
  });
  test('should return 500 status code when error occurs', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CITIZEN_REPAYMENT_PLAN)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });
});

describe('on Post', () => {
  test('should return error when no input text is filled', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send('')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(AMOUNT_REQUIRED);
        expect(res.text).toContain(VALID_YEAR);
        expect(res.text).toContain(VALID_MONTH);
        expect(res.text).toContain(VALID_DAY);
        expect(res.text).toContain(PAYMENT_FREQUENCY_REQUIRED);
      });
  });
  test('should return errors when payment amount is defined and frequency, day, month, year are not defined', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', day: '', month: '', year: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_YEAR);
        expect(res.text).toContain(VALID_MONTH);
        expect(res.text).toContain(VALID_DAY);
        expect(res.text).toContain(PAYMENT_FREQUENCY_REQUIRED);
      });
  });
  test('should return errors when payment amount and frequency are defined and day, month, year are not defined', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '', month: '', year: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_YEAR);
        expect(res.text).toContain(VALID_MONTH);
        expect(res.text).toContain(VALID_DAY);
      });
  });
  test('should return errors when payment amount, frequency and day are defined and month, year are not defined', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '', year: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_YEAR);
        expect(res.text).toContain(VALID_MONTH);
      });
  });
  test('should return errors when payment amount, frequency, day and month are defined and year is not defined', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '11', year: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_YEAR);
      });
  });

  test('should return errors when payment amount, frequency, day, month and year is 0', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '0', month: '0', year: '0' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_DAY);
        expect(res.text).toContain(VALID_MONTH);
        expect(res.text).toContain(FOUR_DIGIT_YEAR_REQUIRED);
      });
  });

  test('should return errors when payment amount, frequency, day, month and year is in the past', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(FIRST_PAYMENT_DATE_IN_THE_FUTURE);
      });
  });

  test('should return errors when payment amount is not defined', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(AMOUNT_REQUIRED);
      });
  });

  test('should return errors when payment amount is -1', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '-1', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(AMOUNT_REQUIRED);
      });
  });

  test('should return errors when payment amount is not less equal than the total amount cliam', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '10000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(EQUAL_INSTALMENTS_REQUIRED);
      });
  });

  test('should return errors when payment amount has more than two decimal places', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_TWO_DECIMAL_NUMBER);
      });
  });

  test('should redirect with valid input', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '08', year: '2022' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
      });
  });
  test('should redirect with valid input with two weeks frequency', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'TWO_WEEKS', day: '1', month: '08', year: '2022' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
      });
  });
  test('should redirect with valid input with every month frequency', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({ paymentAmount: '1000', repaymentFrequency: 'MONTH', day: '1', month: '08', year: '2022' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
      });
  });

  test('should return status 500 when there is error', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .post(CITIZEN_REPAYMENT_PLAN)
      .send({jobTitle: 'Developer', annualTurnover: 70000})
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });
});
