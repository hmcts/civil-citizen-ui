import {
  getFinancialDetailsClaim,
  saveSharedFinancialDetails,
} from 'services/features/response/financialDetails/financialDetailsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

describe('Financial details service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinancialDetailsClaim', () => {
    it('should return the claim from the response draft', async () => {
      const claim = new Claim();
      mockGetResponseClaimById.mockResolvedValue(claim);

      const result = await getFinancialDetailsClaim(mockReq);

      expect(result).toBe(claim);
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getFinancialDetailsClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveSharedFinancialDetails', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveSharedFinancialDetails(mockReq))
        .rejects.toThrow('[financialDetailsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should set taskSharedFinancialDetails and update the response draft', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveSharedFinancialDetails(mockReq);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          taskSharedFinancialDetails: true,
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveSharedFinancialDetails(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
