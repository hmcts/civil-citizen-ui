process.env.NODE_ENV = 'test';
import {app} from '../../../main/app-instance';
import {
  getGADocumentsFromDraftStore,
  saveGADocumentsInDraftStore,
} from '../../../main/modules/draft-store/draftGADocumentService';
import {
  getDraftGAHWFDetails,
  saveDraftGAHWFDetails,
} from '../../../main/modules/draft-store/gaHwFeesDraftStore';
import {UploadGAFiles} from '../../../main/common/models/generalApplication/uploadGAFiles';
import {GaHelpWithFees} from '../../../main/common/models/generalApplication/gaHelpWithFees';

/**
 * Faithful in-memory Redis-like store so the test exercises the real GA_JOURNEY
 * TTL behaviour, rather than a stubbed client.
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

const REDIS_KEY = '1640995200000000user-aaaa';
const DOC_KEY = REDIS_KEY + 'DOCKEY';

const GA_JOURNEY_TTL_SECONDS = 180 * 86400;
const nowInSeconds = () => Math.floor(Date.now() / 1000);

beforeEach(() => {
  store = createBackingStore();
  app.locals.draftStoreClient = store;
});

describe('Integration: GA draft-store TTL handling', () => {
  describe('GA documents', () => {
    it('applies the GA-journey TTL when saving documents and reads them back', async () => {
      const files = [{caseDocument: {documentName: 'evidence.pdf'}} as unknown as UploadGAFiles];

      await saveGADocumentsInDraftStore(REDIS_KEY, files);

      const ttl = await store.ttl(DOC_KEY);
      expect(store.set).toHaveBeenCalledWith(DOC_KEY, expect.any(String), 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(GA_JOURNEY_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(GA_JOURNEY_TTL_SECONDS + 2);
      await expect(getGADocumentsFromDraftStore(REDIS_KEY)).resolves.toEqual(files);
    });

    it('preserves the existing TTL (KEEPTTL) when documents are re-saved', async () => {
      await saveGADocumentsInDraftStore(REDIS_KEY, [{} as UploadGAFiles]);

      // Simulate the key being part way through its life.
      await store.expireat(DOC_KEY, nowInSeconds() + 100);
      store.set.mockClear();
      store.expireat.mockClear();

      await saveGADocumentsInDraftStore(REDIS_KEY, [{} as UploadGAFiles]);

      const ttl = await store.ttl(DOC_KEY);
      expect(store.set).toHaveBeenCalledWith(DOC_KEY, expect.any(String), 'KEEPTTL');
      expect(store.expireat).not.toHaveBeenCalled();
      expect(ttl).toBeGreaterThan(90);
      expect(ttl).toBeLessThanOrEqual(100);
    });

    it('applies a TTL to a legacy documents key that previously had none', async () => {
      store.map.set(DOC_KEY, JSON.stringify([{} as UploadGAFiles]));
      expect(await store.ttl(DOC_KEY)).toBe(-1);

      await saveGADocumentsInDraftStore(REDIS_KEY, [{} as UploadGAFiles]);

      const ttl = await store.ttl(DOC_KEY);
      expect(store.set).toHaveBeenCalledWith(DOC_KEY, expect.any(String), 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(GA_JOURNEY_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(GA_JOURNEY_TTL_SECONDS + 2);
    });
  });

  describe('GA help-with-fees', () => {
    it('applies the GA-journey TTL when saving HwF details and reads them back', async () => {
      const details = Object.assign(new GaHelpWithFees(), {applyHelpWithFees: {option: 'yes'}});

      await saveDraftGAHWFDetails(REDIS_KEY, details);

      const ttl = await store.ttl(REDIS_KEY);
      expect(store.set).toHaveBeenCalledWith(REDIS_KEY, expect.any(String), 'EX', expect.any(Number));
      expect(ttl).toBeGreaterThan(GA_JOURNEY_TTL_SECONDS - 5);
      expect(ttl).toBeLessThanOrEqual(GA_JOURNEY_TTL_SECONDS + 2);
      await expect(getDraftGAHWFDetails(REDIS_KEY)).resolves.toEqual(details);
    });
  });
});
