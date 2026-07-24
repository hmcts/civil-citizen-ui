process.env.NODE_ENV = 'test';
import {app} from '../../../main/app-instance';
import {
  deletePaymentConfirmationUrl,
  deleteUserId,
  getPaymentConfirmationUrl,
  getUserId,
  saveOriginalPaymentConfirmationUrl,
  saveUserId,
} from '../../../main/modules/draft-store/paymentSessionStoreService';
import {FeeType} from '../../../main/common/form/models/helpWithFees/feeType';

const userIdForPayment = 'userIdForPayment';
const confirmationUrl = 'confirmationUrl';

const newUserIdKey = (claimId: string, feeType: FeeType) => claimId + feeType + userIdForPayment;
const legacyUserIdKey = (claimId: string) => claimId + userIdForPayment;
const newConfirmationUrlKey = (claimId: string, feeType: FeeType, userId: string) =>
  claimId + feeType + userId + confirmationUrl;
const legacyConfirmationUrlKey = (userId: string) => userId + userIdForPayment;

/**
 * Faithful in-memory Redis-like store so the test exercises the real keying logic
 * in paymentSessionStoreService (the DTSCCI-4177 fix), not a stubbed-out client.
 */
const createBackingStore = () => {
  const map = new Map<string, string>();
  const expirations = new Map<string, number>();
  return {
    map,
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

beforeEach(() => {
  store = createBackingStore();
  app.locals.draftStoreClient = store;
});

describe('Integration: paymentSessionStoreService (DTSCCI-4177 payment session keying)', () => {
  describe('userId session keys', () => {
    it('saves and reads back a userId using the fee-type specific key', async () => {
      await saveUserId(CLAIM_ID, FeeType.HEARING, USER_ID);

      expect(store.map.get(newUserIdKey(CLAIM_ID, FeeType.HEARING))).toEqual(USER_ID);
      await expect(getUserId(CLAIM_ID, FeeType.HEARING)).resolves.toEqual(USER_ID);
    });

    it('keeps hearing and claim-issued payment sessions isolated on the same claim', async () => {
      const hearingUser = 'user-hearing';
      const claimIssuedUser = 'user-claim-issued';

      await saveUserId(CLAIM_ID, FeeType.HEARING, hearingUser);
      await saveUserId(CLAIM_ID, FeeType.CLAIMISSUED, claimIssuedUser);

      // The pre-4177 bug overwrote one with the other; both must now survive.
      await expect(getUserId(CLAIM_ID, FeeType.HEARING)).resolves.toEqual(hearingUser);
      await expect(getUserId(CLAIM_ID, FeeType.CLAIMISSUED)).resolves.toEqual(claimIssuedUser);
      expect(store.map.get(newUserIdKey(CLAIM_ID, FeeType.HEARING))).toEqual(hearingUser);
      expect(store.map.get(newUserIdKey(CLAIM_ID, FeeType.CLAIMISSUED))).toEqual(claimIssuedUser);
    });

    it('falls back to the legacy claim-only key when no fee-type key exists', async () => {
      store.map.set(legacyUserIdKey(CLAIM_ID), 'legacy-user');

      await expect(getUserId(CLAIM_ID, FeeType.HEARING)).resolves.toEqual('legacy-user');
    });

    it('does not use the legacy key when the legacy fallback is disabled', async () => {
      store.map.set(legacyUserIdKey(CLAIM_ID), 'legacy-user');

      await expect(getUserId(CLAIM_ID, FeeType.HEARING, false)).resolves.toBeNull();
    });

    it('deletes both the fee-type key and the legacy key', async () => {
      store.map.set(newUserIdKey(CLAIM_ID, FeeType.HEARING), USER_ID);
      store.map.set(legacyUserIdKey(CLAIM_ID), 'legacy-user');

      await deleteUserId(CLAIM_ID, FeeType.HEARING);

      expect(store.map.has(newUserIdKey(CLAIM_ID, FeeType.HEARING))).toBe(false);
      expect(store.map.has(legacyUserIdKey(CLAIM_ID))).toBe(false);
      expect(store.del).toHaveBeenCalledWith(newUserIdKey(CLAIM_ID, FeeType.HEARING));
      expect(store.del).toHaveBeenCalledWith(legacyUserIdKey(CLAIM_ID));
    });
  });

  describe('payment confirmation url keys', () => {
    const hearingUrl = 'https://card.payments.service.gov.uk/return/hearing';
    const claimIssuedUrl = 'https://card.payments.service.gov.uk/return/claim-issued';

    it('saves and reads back a confirmation url keyed by claim, fee type and user', async () => {
      await saveOriginalPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID, hearingUrl);

      expect(store.map.get(newConfirmationUrlKey(CLAIM_ID, FeeType.HEARING, USER_ID))).toEqual(hearingUrl);
      await expect(getPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID)).resolves.toEqual(hearingUrl);
    });

    it('keeps confirmation urls isolated when the same user pays two fees on the same claim', async () => {
      await saveOriginalPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID, hearingUrl);
      await saveOriginalPaymentConfirmationUrl(CLAIM_ID, FeeType.CLAIMISSUED, USER_ID, claimIssuedUrl);

      // This is the exact concurrency the 4177 fix addresses.
      await expect(getPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID)).resolves.toEqual(hearingUrl);
      await expect(getPaymentConfirmationUrl(CLAIM_ID, FeeType.CLAIMISSUED, USER_ID)).resolves.toEqual(claimIssuedUrl);
    });

    it('falls back to the legacy user-only key when no fee-type url exists', async () => {
      store.map.set(legacyConfirmationUrlKey(USER_ID), 'https://legacy-return-url');

      await expect(getPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID)).resolves.toEqual('https://legacy-return-url');
    });

    it('uses only the legacy key when claimId or feeType are undefined', async () => {
      store.map.set(legacyConfirmationUrlKey(USER_ID), 'https://legacy-return-url');

      await expect(getPaymentConfirmationUrl(undefined, undefined, USER_ID)).resolves.toEqual('https://legacy-return-url');
    });

    it('does not use the legacy key when the legacy fallback is disabled', async () => {
      store.map.set(legacyConfirmationUrlKey(USER_ID), 'https://legacy-return-url');

      await expect(getPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID, false)).resolves.toBeNull();
    });

    it('deletes both the fee-type url and the legacy url', async () => {
      store.map.set(newConfirmationUrlKey(CLAIM_ID, FeeType.HEARING, USER_ID), hearingUrl);
      store.map.set(legacyConfirmationUrlKey(USER_ID), 'https://legacy-return-url');

      await deletePaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID);

      expect(store.map.has(newConfirmationUrlKey(CLAIM_ID, FeeType.HEARING, USER_ID))).toBe(false);
      expect(store.map.has(legacyConfirmationUrlKey(USER_ID))).toBe(false);
    });
  });

  describe('TTL handling', () => {
    const PAYMENT_SESSION_TTL_SECONDS = 7 * 86400;
    const hearingUrl = 'https://card.payments.service.gov.uk/return/hearing';

    const nowInSeconds = () => Math.floor(Date.now() / 1000);

    it('applies the payment-session TTL when saving a new userId', async () => {
      await saveUserId(CLAIM_ID, FeeType.HEARING, USER_ID);

      const ttl = await store.ttl(newUserIdKey(CLAIM_ID, FeeType.HEARING));
      expect(store.set).toHaveBeenCalledWith(
        newUserIdKey(CLAIM_ID, FeeType.HEARING),
        USER_ID,
        'EX',
        expect.any(Number),
      );
      expect(ttl).toBeGreaterThan(PAYMENT_SESSION_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(PAYMENT_SESSION_TTL_SECONDS + 2);
    });

    it('applies the payment-session TTL when saving a confirmation url', async () => {
      await saveOriginalPaymentConfirmationUrl(CLAIM_ID, FeeType.HEARING, USER_ID, hearingUrl);

      const ttl = await store.ttl(newConfirmationUrlKey(CLAIM_ID, FeeType.HEARING, USER_ID));
      expect(ttl).toBeGreaterThan(PAYMENT_SESSION_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(PAYMENT_SESSION_TTL_SECONDS + 2);
    });

    it('preserves the existing TTL (KEEPTTL) when overwriting a userId rather than resetting it', async () => {
      const key = newUserIdKey(CLAIM_ID, FeeType.HEARING);
      await saveUserId(CLAIM_ID, FeeType.HEARING, USER_ID);

      // Simulate the key being part way through its life.
      await store.expireat(key, nowInSeconds() + 100);
      store.set.mockClear();
      store.expireat.mockClear();

      await saveUserId(CLAIM_ID, FeeType.HEARING, 'user-bbbb');

      const ttl = await store.ttl(key);
      expect(store.map.get(key)).toEqual('user-bbbb');
      expect(store.set).toHaveBeenCalledWith(key, 'user-bbbb', 'KEEPTTL');
      expect(store.expireat).not.toHaveBeenCalled();
      expect(ttl).toBeGreaterThan(90);
      expect(ttl).toBeLessThanOrEqual(100);
    });

    it('applies a TTL to a legacy key that previously had none', async () => {
      const key = newUserIdKey(CLAIM_ID, FeeType.HEARING);
      // Pre-existing value written before this change, so it has no expiry.
      store.map.set(key, 'legacy-user');
      expect(await store.ttl(key)).toBe(-1);

      await saveUserId(CLAIM_ID, FeeType.HEARING, USER_ID);

      const ttl = await store.ttl(key);
      expect(store.set).toHaveBeenCalledWith(key, USER_ID, 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(PAYMENT_SESSION_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(PAYMENT_SESSION_TTL_SECONDS + 2);
    });
  });
});
