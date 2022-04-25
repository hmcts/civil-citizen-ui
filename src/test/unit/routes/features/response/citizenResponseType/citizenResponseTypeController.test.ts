import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_RESPONSE_TYPE_URL} from '../../../../../../main/routes/urls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {Respondent} from '../../../../../../main/common/models/respondent';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Citizen response type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
        });
    });
  });

  test('should return http 500 when has error in the post method', async () => {
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app)
      .post(CITIZEN_RESPONSE_TYPE_URL)
      .send('responseType=test')
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });

  describe('on GET', () => {
    test('should return empty citizen response type page', async () => {
      mockGetCaseData.mockImplementation(async () => new Claim());
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How do you respond to the claim?');
        });
    });

    test('should return citizen response type page with all information from redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const respondent1 = new Respondent();
        respondent1.responseType = 'test';
        claim.respondent1 = respondent1;
        return claim;
      });
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
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    test('should redirect page when correct input when has information on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const respondent1 = new Respondent();
        respondent1.responseType = 'test';
        claim.respondent1 = respondent1;
        return claim;
      });
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    test('should redirect page when correct input when dont have information on redis of respondent1', async () => {
      mockGetCaseData.mockImplementation(async () => undefined);
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
