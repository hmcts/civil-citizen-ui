import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  VALID_PHONE_NUMBER,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {CITIZEN_PHONE_NUMBER_URL} from '../../../../../../main/routes/urls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Citizen phone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      const dateOfBirthError  ='Cannot read property \'dateOfBirth\' of undefined';
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = undefined;
        return claim;
      });
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: dateOfBirthError});
        });
    });
    test('should return http 500 when has error in the post method', async () => {
      const redisFailureError = 'Redis DraftStore failure.';
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(redisFailureError);
      });
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: redisFailureError});
        });
    });
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
          expect(res.text).toContain(VALID_PHONE_NUMBER);
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
          expect(res.text).toContain(VALID_PHONE_NUMBER);
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
