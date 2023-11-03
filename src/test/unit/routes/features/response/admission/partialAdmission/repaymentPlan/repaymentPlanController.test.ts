import {app} from '../../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, RESPONSE_TASK_LIST_URL} from '../../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../../utils/mockDraftStore';
import {getNextYearValue} from '../../../../../../../utils/dateUtils';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../../main/modules/oidc');

describe('Repayment Plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockFutureYear = getNextYearValue();

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on your repayment plan page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your repayment plan');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return error when no input text is filled', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.PAYMENT_FREQUENCY_REQUIRED);
          expect(res.text).toContain(TestMessages.VALID_AMOUNT_ONE_POUND_OR_MORE);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_DAY);
        });
    });

    it('should return errors when payment amount is defined and frequency, day, month, year are not defined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '1000', day: '', month: '', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.PAYMENT_FREQUENCY_REQUIRED);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_DAY);
        });
    });

    it('should return errors when payment amount and frequency are defined and day, month, year are not defined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '', month: '', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_DAY);
        });
    });

    it('should return errors when payment amount, frequency and day are defined and month, year are not defined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
        });
    });

    it('should return errors when payment amount, frequency, day and month are defined and year is not defined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '11', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
        });
    });

    it('should return errors when payment amount, frequency, day, month and year is 0', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '0', month: '0', year: '0'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
        });
    });

    it('should return errors when payment amount, frequency, day, month and year is in the past', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.FIRST_PAYMENT_MESSAGE);
        });
    });

    it('should return errors when payment amount is not defined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AMOUNT_ONE_POUND_OR_MORE);
        });
    });

    it('should return errors when payment amount is -1', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '-1', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AMOUNT_ONE_POUND_OR_MORE);
        });
    });

    it('should render something went wrong if total claim amount is not set', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '10000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.EQUAL_INSTALMENTS_REQUIRED);
        });
    });

    it('should return errors when payment amount has more than two decimal places', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TWO_DECIMAL_NUMBER);
        });
    });

    it('should redirect with valid input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'WEEK', day: '1', month: '08', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect with valid input with two weeks frequency', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'TWO_WEEKS', day: '1', month: '08', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect with valid input with every month frequency', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'MONTH', day: '1', month: '08', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL)
        .send({jobTitle: 'Developer', annualTurnover: 70000})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
