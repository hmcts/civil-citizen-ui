import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {CITIZEN_DEPENDANTS_EDUCATION_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../../../../main/routes/urls';
import {
  REDIS_ERROR_MESSAGE,
  VALID_INTEGER,
  VALID_NUMBER_FOR_PREVIOUS_PAGE,
  VALID_POSITIVE_NUMBER,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

const EXPECTED_TEXT = 'Children aged 16 to 19 living with you';
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve({})),
};

const mockErrorDraftStore = {
  set: jest.fn(() => {
    throw new Error(REDIS_ERROR_MESSAGE);
  }),
  get: jest.fn(() => {
    throw new Error(REDIS_ERROR_MESSAGE);
  }),
};

describe('Dependant Teenagers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    app.locals.draftStoreClient = mockDraftStore;
    test('should return dependent teenagers page', async () => {
      await request(app)
        .get(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(EXPECTED_TEXT);
        });
    });
    test('should return 500 error code when there is an error', async () => {
      app.locals.draftStoreClient = mockErrorDraftStore;
      await request(app)
        .get(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: REDIS_ERROR_MESSAGE});
        });
    });
  });
  describe('on POST', () => {
    app.locals.draftStoreClient = mockDraftStore;
    test('should show error when no number is added', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_INTEGER);
        });
    });
    test('should show error when number is negative', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: -1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_POSITIVE_NUMBER);
        });
    });
    test('should show error when number is decimal', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1.3, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_INTEGER);
        });
    });
    test('should show error when number is greater than maxValue', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 4, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_NUMBER_FOR_PREVIOUS_PAGE);
        });
    });
    test('should redirect when no errors', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    test('should return 500 code when there is an error', async () => {
      app.locals.draftStoreClient = mockErrorDraftStore;
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: REDIS_ERROR_MESSAGE});
        });
    });
  });
});
