import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_TASK_LIST_URL, CLAIM_COMPLETING_CLAIM_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('services/features/claim/completingClaimService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockSaveCompletingClaim = saveCompletingClaim as jest.Mock;

describe('Completing Claim', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveCompletingClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return completing claim page', async () => {
      await request(app)
        .get(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Get the details right');
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to TaskList page', async () => {
      await request(app)
        .post(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_TASK_LIST_URL);
        });

      expect(mockSaveCompletingClaim).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveCompletingClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
