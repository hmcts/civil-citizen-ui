import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../../main/app';
import {
  CITIZEN_PAYMENT_DATE_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../../../../../../main/routes/urls';
import {
  REDIS_ERROR_MESSAGE,
  VALID_PAYMENT_OPTION,
} from '../../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../../main/modules/draft-store');
const mockDraftStore = {
  get: jest.fn(() => Promise.resolve('{}')),
  set: jest.fn(() => Promise.resolve()),
};

const mockGetExceptionDraftStore = {
  get: jest.fn(() => {
    throw new Error(REDIS_ERROR_MESSAGE);
  }),
  set: jest.fn(() => {
    throw new Error(REDIS_ERROR_MESSAGE);
  }),
};


describe('Payment Option Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });
    test('should return payment option page successfully', async () => {
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('When do you want to pay?');
        });
    });
    test('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_ERROR_MESSAGE});
        });
    });
  });
  describe('on Post', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });
    test('should validate when option is not selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_PAYMENT_OPTION);
        });
    });
    test('should redirect to claim list when immediately option is selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    test('should redirect to claim list when instalments option is selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    test('should redirect to claim list when instalments option is selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PAYMENT_DATE_URL);
        });
    });
    test('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_ERROR_MESSAGE});
        });
    });
  });
});
