import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_EXPLANATION_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

const {app} = require('../../../../../../../main/app');

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Regular Income Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    test('it should display page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_MONTHLY_INCOME_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.REGULAR_INCOME.WHAT_REGULAR_INCOME'));
        });
    });
    test('it should return status 500 when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_MONTHLY_INCOME_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
        });
    });
  });
  describe('on POST', () => {
    test('it should display errors when job is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Income from your job', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_JOB'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.INCOME_JOB'));
        });
    });
    test('it should display errors for amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Income from your job', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_JOB'));
        });
    });
    test('it should display errors for amount when amount is negative', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Income from your job', amount: '-40.66', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_JOB'));
        });
    });
    test('it should show errors when other is selected and data for other is not correctly selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'other', model: {
            other: {
              transactionSources: [
                {
                  name: undefined, amount: '123.33', schedule: 'WEEK',
                },
                {
                  name: 'Universal Credit', amount: '123.33', schedule: undefined,
                },
                {
                  name: 'Income Support', amount: '123.333', schedule: 'MONTH',
                },
              ],
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.ENTER_OTHER_INCOME'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.UNIVERSAL_CREDIT'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_SUPPORT'));
        });
    });
    test('it should redirect when all values are correct', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'income from your job', amount: '40.66', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EXPLANATION_URL);
        });
    });
    test('it should return 500 status when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'income from your job', amount: '40.66', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
