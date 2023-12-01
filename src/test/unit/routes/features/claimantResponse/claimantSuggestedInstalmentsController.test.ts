import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {t} from 'i18next';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL,
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {getNextYearValue} from '../../../../utils/dateUtils';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/claimantResponse/getDecisionOnClaimantProposedPlan');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true,
    isBusiness: () => true}),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('services/features/claimantResponse/claimantResponseService', () => ({
  getFinancialDetails: jest.fn().mockResolvedValueOnce([[], [], [], [], [], [], [], [], []]),
  saveClaimantResponse: jest.fn(),
}));

const getCalculatedDecision = getDecisionOnClaimantProposedPlan as jest.Mock;

getCalculatedDecision.mockImplementation(() => {
  return CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL;
});

describe('Suggest instalments for the defendant', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return suggest instalments page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Suggest instalments for the defendant');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    const mockFutureYear = getNextYearValue();

    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error when no input text is filled', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.AMOUNT_REQUIRED'));
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.PAYMENT_FREQUENCY_REQUIRED'));
        });
    });

    it('should return errors when payment amount is defined, but frequency, day, month and year are not defined', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '1000', day: '', month: '', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.PAYMENT_FREQUENCY_REQUIRED'));
        });
    });

    it('should return errors when payment amount and frequency are defined, but day, month and year are not defined', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '', month: '', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return errors when payment amount, frequency and day are defined, but month, year are not defined', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
        });
    });

    it('should return errors when payment amount, frequency, day and month are defined, but year is not defined', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '1', month: '11', year: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return errors when payment amount, frequency, day, month, but year is 0', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '0', month: '0', year: '0'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return errors when payment amount, frequency, day, month and year provided but date is in the past', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '1000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED'));
        });
    });

    it('should return errors when payment amount is not defined', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '', repaymentFrequency: 'WEEK', day: '14', month: '02', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.AMOUNT_REQUIRED'));
        });
    });

    it('should return errors when payment amount is -1', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '-1', repaymentFrequency: 'WEEK', day: '14', month: '02', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.AMOUNT_REQUIRED'));
        });
    });

    it('should return errors when payment amount is not less equal than the total amount cliam', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '10000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EQUAL_INSTALMENTS_REQUIRED'));
        });
    });

    it('should return errors when payment amount has more than two decimal places', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_TWO_DECIMAL_NUMBER'));
        });
    });

    it('should redirect with valid input', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'WEEK', day: '1', month: '08', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL);
        });
    });

    it('should redirect with valid input with two weeks frequency', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'TWO_WEEKS', day: '1', month: '08', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL);
        });
    });

    it('should redirect with valid input with every month frequency', async () => {
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'MONTH', day: '1', month: '08', year: mockFutureYear})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)
        .send({jobTitle: 'Developer', annualTurnover: 70000})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
