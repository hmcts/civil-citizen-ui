import {app} from '../../../../main/app';
import {DraftClaimResponse} from 'models/draft/draftClaim';
import {
  calculateTtlInSeconds,
  deleteCachedDraft,
  getCachedDraft,
  getRedisKey,
  setCachedDraft,
} from 'modules/draft-store/draftClaimRedisCache';

const mockDraftStoreClient = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;

const mockUserId = 'user-123';
const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const pastExpiry = new Date(Date.now() - 60 * 1000).toISOString();

const mockDraft: DraftClaimResponse = {
  draftId: 'draft-456',
  payload: {claimAmount: 1500},
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: futureExpiry,
};

describe('draftClaimRedisCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRedisKey', () => {
    it('should prefix the user id', () => {
      expect(getRedisKey(mockUserId)).toBe(`draft-claim:${mockUserId}`);
    });
  });

  describe('calculateTtlInSeconds', () => {
    it('should return remaining seconds for a future expiry', () => {
      const ttl = calculateTtlInSeconds(futureExpiry);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should return 0 when expiry is in the past', () => {
      expect(calculateTtlInSeconds(pastExpiry)).toBe(0);
    });
  });

  describe('getCachedDraft', () => {
    it('should return the parsed draft on a cache hit', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(JSON.stringify(mockDraft));

      const result = await getCachedDraft(mockUserId);

      expect(mockDraftStoreClient.get).toHaveBeenCalledWith(`draft-claim:${mockUserId}`);
      expect(result).toEqual(mockDraft);
    });

    it('should return null on a cache miss', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce(null);

      const result = await getCachedDraft(mockUserId);

      expect(result).toBeNull();
      expect(mockDraftStoreClient.del).not.toHaveBeenCalled();
    });

    it('should evict and return null when the cached draft has expired', async () => {
      const expiredDraft = {...mockDraft, expiresAt: pastExpiry};
      mockDraftStoreClient.get.mockResolvedValueOnce(JSON.stringify(expiredDraft));
      mockDraftStoreClient.del.mockResolvedValueOnce(1);

      const result = await getCachedDraft(mockUserId);

      expect(result).toBeNull();
      expect(mockDraftStoreClient.del).toHaveBeenCalledWith(`draft-claim:${mockUserId}`);
    });

    it('should return null when redis read fails', async () => {
      mockDraftStoreClient.get.mockRejectedValueOnce(new Error('redis down'));

      const result = await getCachedDraft(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('setCachedDraft', () => {
    it('should write the draft with a positive ttl', async () => {
      mockDraftStoreClient.setex.mockResolvedValueOnce('OK');

      await setCachedDraft(mockUserId, mockDraft);

      expect(mockDraftStoreClient.setex).toHaveBeenCalledWith(
        `draft-claim:${mockUserId}`,
        expect.any(Number),
        JSON.stringify(mockDraft),
      );
      const ttl = mockDraftStoreClient.setex.mock.calls[0][1];
      expect(ttl).toBeGreaterThan(0);
    });

    it('should skip writing when the draft is already expired', async () => {
      await setCachedDraft(mockUserId, {...mockDraft, expiresAt: pastExpiry});

      expect(mockDraftStoreClient.setex).not.toHaveBeenCalled();
    });

    it('should swallow redis write errors', async () => {
      mockDraftStoreClient.setex.mockRejectedValueOnce(new Error('write failed'));

      await expect(setCachedDraft(mockUserId, mockDraft)).resolves.toBeUndefined();
    });
  });

  describe('deleteCachedDraft', () => {
    it('should delete the redis key', async () => {
      mockDraftStoreClient.del.mockResolvedValueOnce(1);

      await deleteCachedDraft(mockUserId);

      expect(mockDraftStoreClient.del).toHaveBeenCalledWith(`draft-claim:${mockUserId}`);
    });

    it('should swallow redis delete errors', async () => {
      mockDraftStoreClient.del.mockRejectedValueOnce(new Error('delete failed'));

      await expect(deleteCachedDraft(mockUserId)).resolves.toBeUndefined();
    });
  });
});
