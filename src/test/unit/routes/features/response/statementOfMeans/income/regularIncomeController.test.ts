import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {CITIZEN_EXPLANATION_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../../../../main/routes/urls';
import {mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('Regular Income Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    test('should display page successfully', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
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
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });
    test('should display errors when job is selected but no amount or schedule are specified', async () => {
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

    test('should display errors when universal credit is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Universal Credit', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.UNIVERSAL_CREDIT'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.UNIVERSAL_CREDIT'));
        });
    });

    test('should display errors when Jobseeker income based is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Jobseeker’s Allowance (income based)', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.JOBSEEKER_INCOME'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.JOBSEEKER_INCOME'));
        });
    });

    test('should display errors when Jobseeker contribution is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Jobseeker’s Allowance (contribution based)', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.JOBSEEKER_CONTRIBUTION'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.JOBSEEKER_CONTRIBUTION'));
        });
    });

    test('should display errors when income support is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Income Support', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_SUPPORT'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.INCOME_SUPPORT'));
        });
    });

    test('should display errors when Working Tax Credit is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Working Tax Credit', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.WORKING_TAX'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.WORKING_TAX'));
        });
    });

    test('should display errors when Child Tax Credit is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Child Tax Credit', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.CHILD_TAX'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_TAX'));
        });
    });

    test('should display errors when Child Benefit is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Child Benefit', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.CHILD_BENEFIT'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_BENEFIT'));
        });
    });

    test('should display errors when Council Tax Support is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Council Tax Support', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.COUNCIL_TAX'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.COUNCIL_TAX'));
        });
    });

    test('should display errors when Pension is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Pension', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.PENSION'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.PENSION'));
        });
    });

    test('should display errors when other is selected but no amount or schedule are specified', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Other income', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.OTHER'));
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.OTHER'));
        });
    });

    test('should display errors for  Income from your job amount when amount has more than two decimal places', async () => {
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

    test('should display errors for Universal Credit amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Universal Credit', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.UNIVERSAL_CREDIT'));
        });
    });
    test('should display errors for Jobseeker’s Allowance (income based) amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Jobseeker’s Allowance (income based)', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.JOBSEEKER_INCOME'));
        });
    });
    test('should display errors for Jobseeker’s Allowance (contribution based) amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Jobseeker’s Allowance (contribution based)', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.JOBSEEKER_CONTRIBUTION'));
        });
    });
    test('should display errors for Income Support amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Income Support', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_SUPPORT'));
        });
    });
    test('should display errors for Working Tax Credit amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Working Tax Credit', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.WORKING_TAX'));
        });
    });
    test('should display errors for Child Tax Credit amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Child Tax Credit', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.CHILD_TAX'));
        });
    });
    test('should display errors for Child Benefit amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Child Benefit', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.CHILD_BENEFIT'));
        });
    });
    test('should display errors for Council Tax Support amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Council Tax Support', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.COUNCIL_TAX'));
        });
    });
    test('should display errors for Pension amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Pension', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.PENSION'));
        });
    });
    test('should display errors for other income amount when amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_INCOME_URL)
        .send({
          declared: 'job', model: {
            job: {
              transactionSource:
                {
                  name: 'Other income', amount: '40.666', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.OTHER'));
        });
    });

    test('should display errors for amount when amount is negative', async () => {
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
    test('should show errors when other is selected and data for other is not correctly selected', async () => {
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
    test('should redirect when all values are correct', async () => {
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
    test('should return 500 status when error occurs', async () => {
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
