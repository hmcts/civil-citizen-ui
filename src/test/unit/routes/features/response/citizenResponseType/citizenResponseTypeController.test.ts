import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../../../../main/routes/urls';
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
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return http 500 when has error in the post method', async () => {
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app)
      .post(CITIZEN_RESPONSE_TYPE_URL)
      .send('responseType=test')
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  describe('on GET', () => {
    it('should return empty citizen response type page', async () => {
      mockGetCaseData.mockImplementation(async () => new Claim());
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How do you respond to the claim?');
        });
    });

    it('should return citizen response type page with all information from redis', async () => {
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
    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Choose your response');
        });
    });

    it('should redirect page when correct input', async () => {
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect page when correct input when has information on redis', async () => {
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

    it('should redirect page when correct input when dont have information on redis of respondent1', async () => {
      mockGetCaseData.mockImplementation(async () => undefined);
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });

    it('should redirect page when user selects I admit part of the claim ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const respondent1 = new Respondent();
        respondent1.responseType = 'test';
        claim.respondent1 = respondent1;
        return claim;
      });
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=PART_ADMISSION')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_ALREADY_PAID_URL);
        });
    });

    it('should redirect to task list page when user selects I admit all of the claim', async () => {
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=FULL_ADMISSION')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });

    it('should redirect to reject claim page when user selects I reject all of the claim', async () => {
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=FULL_DEFENCE')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_REJECT_ALL_CLAIM_URL);
        });
    });
  });
});
