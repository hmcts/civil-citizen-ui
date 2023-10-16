import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {CITIZEN_MONTHLY_EXPENSES_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../../../../main/routes/urls';
import {mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('Regular Expenses Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should display page successfully', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .get(CITIZEN_MONTHLY_EXPENSES_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What are your regular expenses?');
        });
    });
    it('should return 500 status code when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_MONTHLY_EXPENSES_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });
    it('should show errors when mortgage is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'mortgage', model: {
            mortgage: {
              transactionSource:
                {
                  name: 'mortgage', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.MORTGAGE_SCHEDULE_ERROR);

          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.MORTGAGE'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.MORTGAGE'));
        });
    });
    it('should show errors when mortgage and rent are selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: ['mortgage', 'rent'], model: {
            mortgage: {
              transactionSource:
                {
                  name: 'mortgage', amount: '', schedule: undefined,
                },
            },
            rent: {
              transactionSource:
                {
                  name: 'rent', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.MORTGAGE_SCHEDULE_ERROR);
          expect(res.text).toContain(TestMessages.RENT_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.RENT_SCHEDULE_ERROR);

          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.MORTGAGE'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.MORTGAGE'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.RENT'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.RENT'));
        });
    });

    it('should show errors councilTax is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'councilTax', model: {
            councilTax: {
              transactionSource:
                {
                  name: 'Council Tax', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.COUNCIL_TAX'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.COUNCIL_TAX'));
        });
    });

    it('should show errors gas is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: ['gas'], model: {
            gas: {
              transactionSource:
                {
                  name: 'gas', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.GAS'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.GAS'));
        });
    });

    it('should show errors water is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: ['water'], model: {
            water: {
              transactionSource:
                {
                  name: 'water', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.WATER'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.WATER'));
        });
    });

    it('should show errors electricity is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: ['electricity'], model: {
            electricity: {
              transactionSource:
                {
                  name: 'electricity', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.ELECTRICITY'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.ELECTRICITY'));
        });
    });

    it('should show errors travel is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'travel', model: {
            travel: {
              transactionSource:
                {
                  name: 'travel', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.TRAVEL'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.TRAVEL'));
        });
    });

    it('should show errors school cost is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'schoolCosts', model: {
            schoolCosts: {
              transactionSource:
                {
                  name: 'school costs (include clothing)', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.SCHOOL_COSTS'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.SCHOOL_COSTS'));
        });
    });

    it('should show errors food and housekeeping is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'foodAndHousekeeping', model: {
            foodAndHousekeeping: {
              transactionSource:
                {
                  name: 'food and housekeeping', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.FOOD_HOUSEKEEPING'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.FOOD_HOUSEKEEPING'));
        });
    });

    it('should show errors tv and broadband is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'tvAndBroadband', model: {
            tvAndBroadband: {
              transactionSource:
                {
                  name: 'TV and broadband', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.TV_AND_BROADBAND'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.TV_AND_BROADBAND'));
        });
    });

    it('should show errors hire purchase is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'hirePurchase', model: {
            hirePurchase: {
              transactionSource:
                {
                  name: 'hire purchase', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.HIRE_PURCHASES'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.HIRE_PURCHASES'));
        });
    });

    it('should show errors mobile phone is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'mobilePhone', model: {
            mobilePhone: {
              transactionSource:
                {
                  name: 'mobile phone', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.MOBILE_PHONE'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.MOBILE_PHONE'));
        });
    });

    it('should show errors maintenance payments is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'maintenance', model: {
            maintenance: {
              transactionSource:
                {
                  name: 'maintenance payments', amount: '', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.MAINTENANCE_PAYMENTS'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.MAINTENANCE_PAYMENTS'));
        });
    });

    it('should show errors other is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'other', model: {
            other: {
              transactionSources: [
                {
                  name: '', amount: '', schedule: undefined,
                },
              ],
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT.OTHER'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.OTHER'));
        });
    });

    it('should show errors when mortgage is selected but no schedule selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'mortgage', model: {
            mortgage: {
              transactionSource:
                {
                  name: 'mortgage', amount: '123', schedule: undefined,
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_SCHEDULE_ERROR);
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.MORTGAGE'));
        });
    });
    it('should show errors when mortgage is selected and amount is negative', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'mortgage', model: {
            mortgage: {
              transactionSource:
                {
                  name: 'mortgage', amount: '-123', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_CORRECT_AMOUNT_ERROR);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT_FORMAT.MORTGAGE'));
        });
    });
    it('should show errors when mortgage is selected and amount has three decimal places', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'mortgage', model: {
            mortgage: {
              transactionSource:
                {
                  name: 'mortgage', amount: '123.333', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_CORRECT_AMOUNT_ERROR);
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT_FORMAT.MORTGAGE'));
        });
    });
    it('should show errors when other is selected and data for other is not correctly selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'other', model: {
            other: {
              transactionSources: [
                {
                  name: undefined, amount: '123.33', schedule: 'WEEK',
                },
                {
                  name: 'Dog groomers', amount: '123.33', schedule: undefined,
                },
                {
                  name: 'Livery', amount: '123.333', schedule: 'MONTH',
                },
              ],
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.EXPENSES_ENTER_OTHER_SOURCE'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_AMOUNT_FORMAT.OTHER'));
          expect(res.text).toContain(t('ERRORS.EXPENSES_FREQUENCY.OTHER'));
        });
    });
    it('should redirect when no data is selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_INCOME_URL);
        });
    });
    it('should redirect when correct data is selected', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'mortgage', model: {
            mortgage: {
              transactionSource:
                {
                  name: 'mortgage', amount: '123.33', schedule: 'WEEK',
                },
            },
          },
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_INCOME_URL);
        });
    });
    it('should redirect when correct data for other expenses', async () => {
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({
          declared: 'other', model: {
            other: {
              transactionSources: [
                {
                  name: 'other things', amount: '123.33', schedule: 'WEEK',
                },
                {
                  name: 'and some more other things', amount: '123.33', schedule: 'MONTH',
                },
              ],
            },
          },
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_INCOME_URL);
        });
    });
    it('should return status 500 when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
