import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_PHONE_NUMBER_URL, CITIZEN_RESPONSE_TYPE_URL} from '../../../../../../main/routes/urls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';

jest.mock('../../../../../../main/modules/oidc');
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
      const telephoneNumberError = 'Cannot read property \'telephoneNumber\' of undefined';
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = undefined;
        return claim;
      });
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: telephoneNumberError});
        });
    });
  });

  test('should return http 500 when has error in the post method', async () => {
    const redisFailureError = 'Redis DraftStore failure.';
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(redisFailureError);
    });
    await request(app)
      .post(CITIZEN_RESPONSE_TYPE_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: redisFailureError});
      });
  });
  describe('on GET', () => {
    test('should return citizen response type page', async () => {
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How do you respond to the claim?');
        });
    });
  });

  describe('on POST', () => {
    test('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Choose your response');
        });
    });

    test('should redirect page when correct input', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
