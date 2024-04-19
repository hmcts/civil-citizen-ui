import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/server';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
} from '../../../../../../main/routes/urls';
import {mockCivilClaim, mockCivilClaimUndefined, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {TransactionSchedule} from '../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('CCJ Repayment Plan page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return CCJ Repayment Plan page empty when dont have information on redis ', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim response if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
        .send({
          amount: '1000',
          firstPaymentDate: {
            day: '01',
            month: '12',
            year: '2060',
          },
          paymentFrequency: TransactionSchedule.WEEK,
          totalClaimAmount: 5000,
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CCJ_CHECK_AND_SEND_URL);
        });
    });

    describe('instalmentAmount', () => {
      it('should return error when no amount input', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '',
            firstPaymentDate: {
              day: '01',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_AMOUNT'));
          });
      });

      it('should return error when negative amount input', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '-10',
            firstPaymentDate: {
              day: '01',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_AMOUNT'));
          });
      });

      it('should return error when amount is more than two decimal places', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.123',
            firstPaymentDate: {
              day: '01',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.AMOUNT_INVALID_DECIMALS'));
          });
      });

      it('should return error when amount is more than total claim amount', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '5000',
            firstPaymentDate: {
              day: '01',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 1000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_INSTALMENT_AMOUNT'));
          });
      });
    });

    describe('firstPaymentDate', () => {
      it('should return error for day larger than 31', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '32',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          });
      });

      it('should return error for day when no input', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          });
      });

      it('should return error for month larger than 12', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '30',
              month: '13',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          });
      });

      it('should return error for month when no input', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '31',
              month: '',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          });
      });

      it('should return error for year not 4 digits', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '10',
              year: '999',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
          });
      });

      it('should return error for year when no input', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          });
      });

      it('should return error when year is larger than 9999', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '10000',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          });
      });

      it('should return error for date that is before a month from now', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '2010',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.VALID_DATE_ONE_MONTH_FROM_TODAY'));
          });
      });
    });

    describe('paymentFrequency', () => {
      it('should return error when no payment frequency option selected', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '2010',
            },
            paymentFrequency: undefined,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('ERRORS.PAYMENT_FREQUENCY_REQUIRED'));
          });
      });
    });

    describe('valid inputs', () => {
      it('should redirect check your answers page on valid inputs (paymentFrequency: WEEK)', async () => {
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.WEEK,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.text).toContain(`Redirecting to ${CCJ_CHECK_AND_SEND_URL}`);
            expect(res.get('location')).toBe(CCJ_CHECK_AND_SEND_URL);
          });
      });

      it('should redirect check your answers page on valid inputs (paymentFrequency: 2 WEEKS)', async () => {
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.TWO_WEEKS,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.text).toContain(`Redirecting to ${CCJ_CHECK_AND_SEND_URL}`);
            expect(res.get('location')).toBe(CCJ_CHECK_AND_SEND_URL);
          });
      });

      it('should redirect check your answers page on valid inputs (paymentFrequency: MONTH)', async () => {
        await request(app)
          .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
          .send({
            amount: '100.50',
            firstPaymentDate: {
              day: '10',
              month: '12',
              year: '2060',
            },
            paymentFrequency: TransactionSchedule.MONTH,
            totalClaimAmount: 5000,
          })
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.text).toContain(`Redirecting to ${CCJ_CHECK_AND_SEND_URL}`);
            expect(res.get('location')).toBe(CCJ_CHECK_AND_SEND_URL);
          });
      });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL)
        .send({
          amount: '100.50',
          firstPaymentDate: {
            day: '10',
            month: '12',
            year: '2060',
          },
          paymentFrequency: TransactionSchedule.WEEK,
          totalClaimAmount: 5000,
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
