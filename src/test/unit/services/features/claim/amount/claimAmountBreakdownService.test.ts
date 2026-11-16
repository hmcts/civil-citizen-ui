import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  getClaimAmountBreakdownForm,
  saveClaimAmountBreakdownForm,
} from 'services/features/claim/amount/claimAmountBreakdownService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {AmountBreakdown} from 'form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from 'form/models/claim/amount/claimAmountRow';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    user: {id: '123'},
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt,
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('claim amount breakdown service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaimAmountBreakdownForm', () => {
    it('should get claim amount breakdown when claim has breakdown', async () => {
      const claim = new Claim();
      claim.claimAmountBreakup = [{value: {claimAmount: '200', claimReason: 'just because'}}];
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const amountBreakdown = await getClaimAmountBreakdownForm(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(amountBreakdown.claimAmountRows?.length).toEqual(4);
      expect(amountBreakdown.claimAmountRows[0].amount).toEqual(200);
      expect(amountBreakdown.claimAmountRows[0].reason).toEqual('just because');
    });

    it('should get empty claim amount breakdown when claim does not have breakdown', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const amountBreakdown = await getClaimAmountBreakdownForm(mockReq);

      expect(amountBreakdown.claimAmountRows?.length).toEqual(4);
      expect(amountBreakdown.claimAmountRows[0].amount).toBeUndefined();
      expect(amountBreakdown.claimAmountRows[0].reason).toBeUndefined();
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(getClaimAmountBreakdownForm(mockReq)).rejects.toThrow(
        '[claimAmountBreakdownService] no draft claim found',
      );
    });

    it('should throw error when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getClaimAmountBreakdownForm(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimAmountBreakdownForm', () => {
    const form = new AmountBreakdown([new ClaimAmountRow('just because', 200), new ClaimAmountRow()]);

    it('should save claim amount successfully', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimAmountBreakdownForm(mockReq, form);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimAmountBreakup: [{
            value: {
              claimAmount: '200.00',
              claimReason: 'just because',
            },
          }],
          totalClaimAmount: 200,
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimAmountBreakdownForm(mockReq, form);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'draft-123',
      );
    });

    it('should use rawResponse draftId when session has none', async () => {
      const reqWithoutDraftId = {session: {user: {id: '123'}}} as unknown as AppRequest;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimAmountBreakdownForm(reqWithoutDraftId, form);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(reqWithoutDraftId, expect.any(Claim), 'draft-123');
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveClaimAmountBreakdownForm(mockReq, form)).rejects.toThrow(
        '[claimAmountBreakdownService] no draft claim found',
      );
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should throw exception when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveClaimAmountBreakdownForm(mockReq, form)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
