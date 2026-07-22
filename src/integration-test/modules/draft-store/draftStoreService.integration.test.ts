process.env.NODE_ENV = 'test';
import {app} from '../../../main/app-instance';
import {
  createDraftClaimInStoreWithExpiryTime,
  getDraftClaimFromStore,
  saveDraftClaim,
} from '../../../main/modules/draft-store/draftStoreService';
import {TTLCategory} from '../../../main/modules/draft-store/ttlConfig';
import {Claim} from '../../../main/common/models/claim';

/**
 * Faithful in-memory Redis-like store so the test exercises the real TTL logic
 * in draftStoreService / redisWriteHelper, including
 * KEEPTTL preservation and creation-date reconstruction, rather than a stubbed
 * client.
 */
const createBackingStore = () => {
  const map = new Map<string, string>();
  const expirations = new Map<string, number>();
  return {
    map,
    expirations,
    set: jest.fn((key: string, value: string, ...args: string[]) => {
      map.set(key, value);
      if (args[0] === 'EX') {
        expirations.set(key, Math.floor(Date.now() / 1000) + Number(args[1]));
      } else if (args[0] !== 'KEEPTTL') {
        expirations.delete(key);
      }
      return Promise.resolve('OK');
    }),
    get: jest.fn((key: string) => Promise.resolve(map.has(key) ? map.get(key) : null)),
    del: jest.fn((key: string) => {
      expirations.delete(key);
      const existed = map.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }),
    ttl: jest.fn((key: string) => {
      if (!map.has(key)) {
        return Promise.resolve(-2);
      }
      const expiry = expirations.get(key);
      if (!expiry) {
        return Promise.resolve(-1);
      }
      const remaining = expiry - Math.floor(Date.now() / 1000);
      return Promise.resolve(remaining > 0 ? remaining : -2);
    }),
    expireat: jest.fn((key: string, timestamp: number) => {
      expirations.set(key, timestamp);
      return Promise.resolve(1);
    }),
  };
};

let store: ReturnType<typeof createBackingStore>;

const CLAIM_ID = '1640995200000000';
const USER_ID = 'user-aaaa';

const DAY_IN_SECONDS = 86400;
const DRAFT_CLAIM_TTL_SECONDS = 30 * DAY_IN_SECONDS;
const MAX_MIDNIGHT_ALIGNED_DRAFT_CLAIM_TTL_SECONDS = 31 * DAY_IN_SECONDS;
const JOURNEY_CACHE_TTL_SECONDS = 180 * DAY_IN_SECONDS;

const nowInSeconds = () => Math.floor(Date.now() / 1000);

beforeEach(() => {
  store = createBackingStore();
  app.locals.draftStoreClient = store;
});

describe('Integration: draftStoreService TTL handling', () => {
  describe('createDraftClaimInStoreWithExpiryTime', () => {
    it('applies the draft-claim TTL anchored to the creation date', async () => {
      await createDraftClaimInStoreWithExpiryTime(CLAIM_ID);

      const ttl = await store.ttl(CLAIM_ID);
      expect(store.set).toHaveBeenCalledWith(CLAIM_ID, expect.any(String), 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(DRAFT_CLAIM_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(MAX_MIDNIGHT_ALIGNED_DRAFT_CLAIM_TTL_SECONDS + 2);

      const stored = await getDraftClaimFromStore(CLAIM_ID);
      expect(stored.case_data.draftClaimCreatedAt).toBeDefined();
      expect(stored.case_data.draftClaimCacheTtlDays).toBe(30);
    });
  });

  describe('saveDraftClaim with DRAFT_CLAIM category', () => {
    it('stamps draftClaimCreatedAt and applies the draft-claim TTL for a brand new claim', async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;

      await saveDraftClaim(CLAIM_ID, claim, true);

      const ttl = await store.ttl(CLAIM_ID);
      expect(claim.draftClaimCreatedAt).toBeDefined();
      expect(claim.draftClaimCacheTtlDays).toBe(30);
      expect(store.set).toHaveBeenCalledWith(CLAIM_ID, expect.any(String), 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(DRAFT_CLAIM_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(MAX_MIDNIGHT_ALIGNED_DRAFT_CLAIM_TTL_SECONDS + 2);
    });

    it('preserves the existing TTL (KEEPTTL) when re-saving an existing draft', async () => {
      await createDraftClaimInStoreWithExpiryTime(CLAIM_ID);

      // Simulate the draft being part way through its life.
      await store.expireat(CLAIM_ID, nowInSeconds() + 1000);
      store.set.mockClear();
      store.expireat.mockClear();

      const claim = new Claim();
      claim.id = CLAIM_ID;
      await saveDraftClaim(CLAIM_ID, claim, true);

      const ttl = await store.ttl(CLAIM_ID);
      expect(store.set).toHaveBeenCalledWith(CLAIM_ID, expect.any(String), 'KEEPTTL');
      expect(store.expireat).not.toHaveBeenCalled();
      expect(ttl).toBeGreaterThan(900);
      expect(ttl).toBeLessThanOrEqual(1000);
    });

    it('reuses the stored draftClaimCreatedAt when re-saving without a creation date', async () => {
      const createdAt = new Date('2024-01-01T00:00:00.000Z');
      store.map.set(
        CLAIM_ID,
        JSON.stringify({id: CLAIM_ID, case_data: {id: CLAIM_ID, draftClaimCreatedAt: createdAt.toISOString()}}),
      );
      await store.expireat(CLAIM_ID, nowInSeconds() + 1000);

      const claim = new Claim();
      claim.id = CLAIM_ID;
      await saveDraftClaim(CLAIM_ID, claim, true);

      expect(claim.draftClaimCreatedAt).toEqual(createdAt);
    });

    it('reconstructs draftClaimCreatedAt from the remaining TTL for a legacy draft without a creation date', async () => {
      const remainingTtlSeconds = 90 * DAY_IN_SECONDS;
      store.map.set(
        CLAIM_ID,
        JSON.stringify({id: CLAIM_ID, case_data: {id: CLAIM_ID}}),
      );
      await store.expireat(CLAIM_ID, nowInSeconds() + remainingTtlSeconds);
      store.expireat.mockClear();

      const claim = new Claim();
      claim.id = CLAIM_ID;

      const before = Date.now();
      await saveDraftClaim(CLAIM_ID, claim, true);
      const after = Date.now();

      // ~90 days of TTL remaining out of the legacy 180-day TTL => created ~90 days ago.
      const expectedElapsedMs = ((180 * DAY_IN_SECONDS) - remainingTtlSeconds) * 1000;
      const createdAtMs = claim.draftClaimCreatedAt?.getTime() ?? 0;
      expect(createdAtMs).toBeGreaterThanOrEqual(before - expectedElapsedMs - 1000);
      expect(createdAtMs).toBeLessThanOrEqual(after - expectedElapsedMs + 1000);
      // The existing TTL must be preserved, not reset.
      expect(store.expireat).not.toHaveBeenCalled();
    });
  });

  describe('saveDraftClaim with JOURNEY_CACHE category', () => {
    it('applies the journey-cache TTL and does not stamp draftClaimCreatedAt', async () => {
      const redisKey = CLAIM_ID + USER_ID;
      const claim = new Claim();
      claim.id = CLAIM_ID;

      await saveDraftClaim(redisKey, claim, true, undefined, TTLCategory.JOURNEY_CACHE);

      const ttl = await store.ttl(redisKey);
      expect(claim.draftClaimCreatedAt).toBeUndefined();
      expect(store.set).toHaveBeenCalledWith(redisKey, expect.any(String), 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(JOURNEY_CACHE_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(JOURNEY_CACHE_TTL_SECONDS + 2);
    });
  });
});
