import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {DEPENDANT_TEENAGERS_URL, OTHER_DEPENDANTS_URL} from '../../../../../../../main/routes/urls';
import {
  NUMBER_REQUIRED,
  VALID_INTEGER,
  VALID_NUMBER_FOR_PREVIOUS_PAGE,
  VALID_POSITIVE_NUMBER,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve({})),
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
        .get(DEPENDANT_TEENAGERS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Children aged 16 to 19 living with you');
        });
    });
    test('should return 500 error code when there is an error', async () => {
      const mockErrorDraftStore = {
        set: jest.fn(() => {
          throw new Error('Redis DraftStore failure.');
        }),
        get: jest.fn(() => {
          throw new Error('Redis DraftStore failure.');
        }),
      };
      app.locals.draftStoreClient = mockErrorDraftStore;
      await request(app)
        .get(DEPENDANT_TEENAGERS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: 'Error: Redis DraftStore failure.'});
        });
    });
  });
  describe('on POST', () => {
    app.locals.draftStoreClient = mockDraftStore;
    test('should show error when no number is added', async () => {
      await request(app)
        .post(DEPENDANT_TEENAGERS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NUMBER_REQUIRED);
        });
    });
    test('should show error when number is negative', async () => {
      await request(app)
        .post(DEPENDANT_TEENAGERS_URL)
        .send({value: -1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_POSITIVE_NUMBER);
        });
    });
    test('should show error when number is decimal', async () => {
      await request(app)
        .post(DEPENDANT_TEENAGERS_URL)
        .send({value: 1.3, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_INTEGER);
        });
    });
    test('should show error when number is greater than maxValue', async () => {
      await request(app)
        .post(DEPENDANT_TEENAGERS_URL)
        .send({value: 4, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_NUMBER_FOR_PREVIOUS_PAGE);
        });
    });
    test('should redirect when no errors', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(DEPENDANT_TEENAGERS_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(OTHER_DEPENDANTS_URL);
        });
    });
    test('should return 500 code when there is an error', async () => {
      const mockErrorDraftStore = {
        set: jest.fn(() => {
          throw new Error('Redis DraftStore failure.');
        }),
        get: jest.fn(() => {
          throw new Error('Redis DraftStore failure.');
        }),
      };
      app.locals.draftStoreClient = mockErrorDraftStore;
      await request(app)
        .post(DEPENDANT_TEENAGERS_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: 'Error: Redis DraftStore failure.'});
        });
    });
  });
});
