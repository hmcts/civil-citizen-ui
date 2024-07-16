import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_TASK_LIST_URL, CLAIM_COMPLETING_CLAIM_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Completing Claim', () => {
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
    it('should return completing claim page', async () => {
      await request(app)
        .get(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Get the details right');
        });
    });
  });
  describe('on POST', () => {
    it('should redirect to TaskList page', async () => {
      await request(app)
        .post(CLAIM_COMPLETING_CLAIM_URL)
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
        .post(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
