import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import * as claimAmountbreakdownService
  from '../../../../../../main/services/features/claim/amount/claimAmountBreakdownService';
import {AmountBreakdown} from 'form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from 'form/models/claim/amount/claimAmountRow';
import {CLAIM_AMOUNT_URL, CLAIM_INTEREST_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/claim/amount/claimAmountBreakdownService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockServiceGet = claimAmountbreakdownService.getClaimAmountBreakdownForm as jest.Mock;
const mockSaveForm = claimAmountbreakdownService.saveClaimAmountBreakdownForm as jest.Mock;

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

describe('claimAmountBreakdownController test', () => {
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

  describe('On Get', () => {
    it('should return page successfully', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockServiceGet.mockResolvedValue(new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow()]));

      await request(app)
        .get(CLAIM_AMOUNT_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim amount');
        });
    });

    it('should show error page when exception is thrown from the service', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockServiceGet.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_AMOUNT_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('On Post', () => {
    const correctData = {
      claimAmountRows: [
        {
          reason: 'lalala',
          amount: '1',
        },
      ],
      totalAmount: '1',
    };

    it('should show errors when there are errors', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      const data = {
        claimAmountRows: [
          {
            reason: '',
            amount: '1',
          },
        ],
        totalAmount: '1',
      };

      await request(app)
        .post(CLAIM_AMOUNT_URL)
        .send(data)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a reason');
        });
    });

    it('should redirect to the next page successfully when data is correct', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockSaveForm.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_AMOUNT_URL)
        .send(correctData)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_INTEREST_URL);
        });
    });

    it('should show error page when there is an error with service', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockSaveForm.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_AMOUNT_URL)
        .send(correctData)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});