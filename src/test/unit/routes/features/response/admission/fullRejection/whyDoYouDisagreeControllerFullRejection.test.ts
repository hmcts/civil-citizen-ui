import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {civilClaimResponseMock} from '../../../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Why do you disagree Full Rejection Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return Why do you disagree Full Rejection page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Why do you disagree with the claim amount?');
        });
    });

    it('should return status 500 when there is an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });

  describe('on Post', () => {
    it('should validate when text is not fill', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Why do you disagree with the claim amount?');
        });
    });

    it('should redirect to timeline of events when text is filled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .send('text=Test')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_TIMELINE_URL);
        });
    });

    it('should return 500 status when there is error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)
        .send('text=Test')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
