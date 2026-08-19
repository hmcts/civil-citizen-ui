import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_TASK_LIST_URL, CLAIM_COMPLETING_CLAIM_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

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
  });

  describe('on GET', () => {
    it('should return completing claim page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

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
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error('Redis/DB failure'));
      mockGetCaseDataFromStore.mockRejectedValue(new Error('Redis/DB failure'));

      await request(app)
        .post(CLAIM_COMPLETING_CLAIM_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
