import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_TASK_LIST_URL, CLAIM_RESOLVING_DISPUTE_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Resolving Dispute', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseMock.case_data);
    });
  });

  describe('on GET', () => {
    it('should return resolving dispute page', async () => {
      await request(app)
        .get(CLAIM_RESOLVING_DISPUTE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Try to resolve the dispute');
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to TaskList page', async () => {
      await request(app)
        .post(CLAIM_RESOLVING_DISPUTE_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_TASK_LIST_URL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_RESOLVING_DISPUTE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
