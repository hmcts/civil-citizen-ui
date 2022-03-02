import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  NON_NUMERIC_VALUES_NOT_ALLOWED,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {CITIZEN_PHONE_NUMBER_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Citizen phone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});


  });
  describe('on GET', () => {
    test('should return citizen phone number page', async () => {
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a phone number (optional)');
        });
    });
  });
  describe('on POST', () => {
    test('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=abc')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NON_NUMERIC_VALUES_NOT_ALLOWED);
        });
    });
    test('should return error on input with interior spaces', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=123 456')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NON_NUMERIC_VALUES_NOT_ALLOWED);
        });
    });
    test('should accept input with trailing whitespaces', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber= 123 ')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should redirect on correct input', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=123')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
