import {app} from '../../../../../main/app-instance';
import {DraftClaimResponse} from 'models/draft/draftClaim';
import {
  calculateTtlInSeconds,
  deleteCachedDraft,
  getCachedDraft,
  getRedisKey,
  setCachedDraft,
} from 'modules/draft-store/claimantResponse/claimantResponseDraftRedisCache';

const mockDraftStoreClient = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;

const mockUserId = 'user-123';
const caseId = '1645882162449409';
const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const pastExpiry = new Date(Date.now() - 60 * 1000).toISOString();

const mockDraft: DraftClaimResponse = {
  draftId: 'draft-456',
  caseId,
  payload: {claimantResponse: {hasAgreed: true}},
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: futureExpiry,
};

describe('claimantResponseDraftRedisCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRedisKey', () => {
    it('keeps each case on its own key', () => {
      expect(getRedisKey(mockUserId, caseId)).toBe(`draft-claimant-response:${mockUserId}:${caseId}`);
      expect(getRedisKey(mockUserId, '1645882162449410')).not.toBe(getRedisKey(mockUserId, caseId));
    });
  });

  describe('calculateTtlInSeconds', () => {
    it('returns remaining seconds for a future expiry', () => {
      const ttl = calculateTtlInSeconds(futureExpiry);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('returns 0 when expiry is in the past', () => {
      expect(calculateTtlInSeconds(pastExpiry)).toBe(0);
    });
  });

  describe('getCachedDraft', () => {
    it('returns the parsed draft on a cache hit', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(JSON.stringify(mockDraft));

      const result = await getCachedDraft(mockUserId, caseId);

      expect(mockDraftStoreClient.get).toHaveBeenCalledWith(`draft-claimant-response:${mockUserId}:${caseId}`);
      expect(result).toEqual(mockDraft);
    });

    it('returns null on a cache miss', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(null);

      await expect(getCachedDraft(mockUserId, caseId)).resolves.toBeNull();
    });

    it('drops an expired cache entry', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(JSON.stringify({...mockDraft, expiresAt: pastExpiry}));
      mockDraftStoreClient.del.mockResolvedValueOnce(1);

      await expect(getCachedDraft(mockUserId, caseId)).resolves.toBeNull();
      expect(mockDraftStoreClient.del).toHaveBeenCalledWith(`draft-claimant-response:${mockUserId}:${caseId}`);
    });

    it('returns null when redis read fails', async () => {
      mockDraftStoreClient.get.mockRejectedValueOnce(new Error('redis down'));

      await expect(getCachedDraft(mockUserId, caseId)).resolves.toBeNull();
    });
  });

  describe('setCachedDraft', () => {
    it('writes the draft with a positive ttl', async () => {
      mockDraftStoreClient.setex.mockResolvedValueOnce('OK');

      await setCachedDraft(mockUserId, caseId, mockDraft);

      expect(mockDraftStoreClient.setex).toHaveBeenCalledWith(
        `draft-claimant-response:${mockUserId}:${caseId}`,
        expect.any(Number),
        JSON.stringify(mockDraft),
      );
    });

    it('skips writing when the draft is already expired', async () => {
      await setCachedDraft(mockUserId, caseId, {...mockDraft, expiresAt: pastExpiry});

      expect(mockDraftStoreClient.setex).not.toHaveBeenCalled();
    });

    it('swallows redis write errors', async () => {
      mockDraftStoreClient.setex.mockRejectedValueOnce(new Error('write failed'));

      await expect(setCachedDraft(mockUserId, caseId, mockDraft)).resolves.toBeUndefined();
    });
  });

  describe('deleteCachedDraft', () => {
    it('deletes the per-case key', async () => {
      mockDraftStoreClient.del.mockResolvedValueOnce(1);

      await deleteCachedDraft(mockUserId, caseId);

      expect(mockDraftStoreClient.del).toHaveBeenCalledWith(`draft-claimant-response:${mockUserId}:${caseId}`);
    });

    it('swallows redis delete errors', async () => {
      mockDraftStoreClient.del.mockRejectedValueOnce(new Error('delete failed'));

      await expect(deleteCachedDraft(mockUserId, caseId)).resolves.toBeUndefined();
    });
  });
});
