import {
  getClaimIssuePaymentClaim,
  saveClaimIssuePaymentClaim,
} from 'routes/features/claim/payment/claimIssuePaymentDraftService';
import {getDraftClaimForCase, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');

const mockGetDraftClaimForCase = getDraftClaimForCase as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const mockGetClaimById = getClaimById as jest.Mock;

const claimId = '1790252856529614';
const draftId = 'draft-123';
const redisKey = `${claimId}user-id`;

const createReq = (id = claimId): AppRequest => ({
  params: {id},
  session: {
    user: {id: 'user-id'},
  },
} as unknown as AppRequest);

const createClaim = (): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.claimFeePayment = new PaymentInformation('ext', 'RC-1');
  return claim;
};

const createManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: draftId,
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId,
    caseId: claimId,
    payload: claim as unknown as Record<string, unknown>,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    expiresAt: '2026-08-08T10:00:00.000Z',
  },
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-08-08T10:00:00.000Z',
});

describe('claimIssuePaymentDraftService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
  });

  describe('getClaimIssuePaymentClaim', () => {
    it('should return the db draft linked to the case with its draftId', async () => {
      const req = createReq();
      mockGetDraftClaimForCase.mockResolvedValueOnce(createManagerResult(createClaim()));

      const result = await getClaimIssuePaymentClaim(req);

      expect(mockGetDraftClaimForCase).toHaveBeenCalledWith(req, claimId);
      expect(result.draftId).toBe(draftId);
      expect(result.claim).toBeInstanceOf(Claim);
      expect(result.claim.claimDetails.claimFeePayment?.paymentReference).toBe('RC-1');
      expect(result.claim.draftClaimCreatedAt).toEqual(new Date('2026-08-01T10:00:00.000Z'));
      expect(mockGetClaimById).not.toHaveBeenCalled();
    });

    it('should fall back to the Redis payment key when no db draft exists', async () => {
      const req = createReq();
      const redisClaim = createClaim();
      mockGetDraftClaimForCase.mockResolvedValueOnce(null);
      mockGetClaimById.mockResolvedValueOnce(redisClaim);

      const result = await getClaimIssuePaymentClaim(req);

      expect(mockGetClaimById).toHaveBeenCalledWith(claimId, req, true);
      expect(result).toEqual({claim: redisClaim});
    });

    it('should throw when url claim id is missing', async () => {
      await expect(getClaimIssuePaymentClaim(createReq(''))).rejects.toThrow(
        '[claimIssuePaymentDraftService] claim id is required',
      );
      expect(mockGetDraftClaimForCase).not.toHaveBeenCalled();
      expect(mockGetClaimById).not.toHaveBeenCalled();
    });
  });

  describe('saveClaimIssuePaymentClaim', () => {
    it('should update the db draft when a draftId is given', async () => {
      const req = createReq();
      const claim = createClaim();

      await saveClaimIssuePaymentClaim(req, claim, draftId);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(req, claim, draftId);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save to the Redis payment key when no draftId is given', async () => {
      const req = createReq();
      const claim = createClaim();

      await saveClaimIssuePaymentClaim(req, claim);

      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, claim, true, 'user-id');
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });
  });
});
