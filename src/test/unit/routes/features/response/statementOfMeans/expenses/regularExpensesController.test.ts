import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_MONTHLY_EXPENSES_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

const {app} = require('../../../../../../../main/app');

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Regular Expenses Controller', () => {
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
        .get(CITIZEN_MONTHLY_EXPENSES_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What are your regular expenses?');
        });
    });
    test('it should return 500 status code when there is an error', async () => {
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
    test('it should show errors when mortgage is selected but no amount or schedule selected', async () => {
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
        });
    });
    test('it should show errors when mortgage and rent are selected but no amount or schedule selected', async () => {
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
        });
    });
    test('it should show errors when mortgage is selected but no schedule selected', async () => {
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
        });
    });
    test('it should show errors when mortgage is selected and amount is negative', async () => {
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
        });
    });
    test('it should show errors when mortgage is selected and amount has three decimal places', async () => {
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
        });
    });
    test('it should show errors when other is selected and data for other is not correctly selected', async () => {
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
          expect(res.text).toContain(TestMessages.OTHER_EXPENSE_NAME_REQUIRED_ERROR);
          expect(res.text).toContain(TestMessages.OTHER_LIVERY_CORRECT_AMOUNT);
          expect(res.text).toContain(TestMessages.OTHER_EXPENSE_DOG_SCHEDULE_ERROR);
        });
    });
    test('it should redirect when no data is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_MONTHLY_EXPENSES_URL)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_INCOME_URL);
        });
    });
    test('it should redirect when correct data is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
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
    test('it should redirect when correct data for other expenses', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
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
    test('it should return status 500 when error occurs', async () => {
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
