import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getClaimInterest, saveClaimInterest} from 'services/features/claim/interest/claimInterestService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Interest} from 'form/models/interest/interest';

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

describe('Claim interest service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get Claim interest', () => {
    it('should return an empty GenericYesNo when claimInterest is not set', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const result = await getClaimInterest(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(result).toEqual(new GenericYesNo());
    });

    it('should return a claimInterest object with value when data is retrieved', async () => {
      const claim = new Claim();
      claim.claimInterest = YesNo.YES;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const result = await getClaimInterest(mockReq);

      expect(result.option).toEqual(YesNo.YES);
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(getClaimInterest(mockReq)).rejects.toThrow(
        '[claimInterestService] no draft claim found',
      );
    });

    it('should throw an error when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getClaimInterest(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save Claim interest', () => {
    it('should save claim Interest option when option is YES', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimInterest(mockReq, YesNo.YES);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({claimInterest: YesNo.YES}),
        'draft-123',
      );
    });

    it('should save claim Interest option and reset interest when option is NO', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimInterest(mockReq, YesNo.NO);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimInterest: YesNo.NO,
          interest: expect.any(Interest),
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimInterest(mockReq, YesNo.YES);

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

      await saveClaimInterest(reqWithoutDraftId, YesNo.YES);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(reqWithoutDraftId, expect.any(Claim), 'draft-123');
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveClaimInterest(mockReq, YesNo.YES)).rejects.toThrow(
        '[claimInterestService] no draft claim found',
      );
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should throw error when draft store get method throws error', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveClaimInterest(mockReq, YesNo.YES)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when draft store save method throws error', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveClaimInterest(mockReq, YesNo.YES)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
