import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_OWED_AMOUNT_URL, CLAIM_TASK_LIST_URL} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partial Admit - How much money do you admit you owe? Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    test('should display page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_OWED_AMOUNT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much money do you admit you owe?');
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_OWED_AMOUNT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });

  describe('on POST', () => {
    // mock totalClaimAmount is £110
    test('it should show errors when no amount is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    test('it should show errors when amount 0 is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 0 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    test('it should show errors when more than 2 decimals provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 10.123 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    test('it should show errors when negative amount is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: -110 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    test('it should show errors when non-numeric amount is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 'abc' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    test('it should show errors when provided amount is bigger than Claim amount', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 9999999999999 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
        });
    });
    test('it should show errors when provided amount is equal to Claim amount', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 110 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
        });
    });
    test('should redirect page when proper amount provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 100 })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({ amount: 200 })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
});
