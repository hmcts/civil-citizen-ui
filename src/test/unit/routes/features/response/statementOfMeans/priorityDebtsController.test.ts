import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_PRIORITY_DEBTS_URL, CITIZEN_DEBTS_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const {app} = require('../../../../../../main/app');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Priority Debts Controller', () => {
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
        .get(CITIZEN_PRIORITY_DEBTS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Debts you\'re behind on');
        });
    });
    test('it should return 500 status code when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PRIORITY_DEBTS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
  describe('on POST', () => {
    test('it should show errors when mortgage is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '',
          'mortgage-payment-schedule': '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.MORTGAGE_SCHEDULE_ERROR);
        });
    });
    test('it should show errors when mortgage and rent are selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '',
          'mortgage-payment-schedule': '',
          rent: 'rent',
          'rent-payment-amount': '',
          'rent-payment-schedule': '',
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
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '5129',
          'mortgage-payment-schedule': '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_SCHEDULE_ERROR);
        });
    });
    test('it should show errors when mortgage is selected and amount is negative', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '-5129',
          'mortgage-payment-schedule': '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_CORRECT_AMOUNT_ERROR);
        });
    });
    test('it should show errors when mortgage is selected and amount has three decimal places', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '2000.859',
          'mortgage-payment-schedule': '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_CORRECT_AMOUNT_ERROR);
        });
    });
    test('it should redirect when no data is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEBTS_URL);
        });
    });
    test('it should redirect when correct data is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '85.92',
          'mortgage-payment-schedule': 'month',
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEBTS_URL);
        });
    });

    test('it should return status 500 when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          mortgage: 'mortgage',
          'mortgage-payment-amount': '85.92',
          'mortgage-payment-schedule': 'month',
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});