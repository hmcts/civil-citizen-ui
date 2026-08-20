import {AppRequest} from 'models/AppRequest';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Claim} from 'models/claim';
import {Reason} from 'form/models/claim/details/reason';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    draftId: 'test-draft-id',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'test-draft-id',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt,
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Claim Details Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaimDetails', () => {
    it('should return empty ClaimDetails if claimDetails is not set on claim', async () => {
      const claim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const claimDetails = await getClaimDetails(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(claimDetails).toBeInstanceOf(ClaimDetails);
      expect(claimDetails?.reason).toBeUndefined();
    });

    it('should return claimDetails object with reason', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.reason = new Reason('Test reason');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const claimDetails = await getClaimDetails(mockReq);

      expect(claimDetails?.reason?.text).toBe('Test reason');
    });

    it('should return empty ClaimDetails when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      const claimDetails = await getClaimDetails(mockReq);

      expect(claimDetails).toBeInstanceOf(ClaimDetails);
      expect(claimDetails?.reason).toBeUndefined();
    });

    it('should return claimDetails object with evidence', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.evidence = new Evidence('', [
        new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Describe evidence...'),
        new EvidenceItem(EvidenceType.CORRESPONDENCE, 'Describe evidence...'),
      ]);

      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const claimDetails = await getClaimDetails(mockReq);

      expect(claimDetails?.evidence?.evidenceItem?.length).toBe(2);
    });

    it('should throw error on draft store manager failure', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getClaimDetails(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimDetails', () => {
    it('should save claim details successfully when claimDetails exists', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue(undefined);

      const reason = new Reason('reason');
      await saveClaimDetails(mockReq, reason, 'reason');

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimDetails: expect.objectContaining({
            reason: reason,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should create new ClaimDetails instance if claimDetails does not exist and call updateDraftClaim', async () => {
      const claim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue(undefined);

      const reason = new Reason('new reason');
      await saveClaimDetails(mockReq, reason, 'reason');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimDetails: expect.objectContaining({
            reason: reason,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should map draftResult.createdAt to claim.draftClaimCreatedAt when missing on SAVE', async () => {
      const claim = new Claim();
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim, createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue(undefined);

      await saveClaimDetails(mockReq, new Reason('test'), 'reason');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'test-draft-id',
      );
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveClaimDetails(mockReq, new Reason('test'), 'reason')).rejects.toThrow(
        '[claimDetailsService] no draft claim found to update',
      );
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should fall back to rawResponse.draftId if req.session.draftId is missing', async () => {
      const reqWithoutSessionDraftId = {session: {}} as AppRequest;
      const claim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue(undefined);

      await saveClaimDetails(reqWithoutSessionDraftId, new Reason('test'), 'reason');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        reqWithoutSessionDraftId,
        expect.any(Object),
        'test-draft-id',
      );
    });

    it('should throw error on draft store manager update failure', async () => {
      const claim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveClaimDetails(mockReq, new Reason('test'), 'reason')).rejects.toThrow(
        TestMessages.REDIS_FAILURE,
      );
    });
  });
});