jest.mock('../../../../main/app-instance', () => jest.requireActual('../../../utils/getRouteHandler'));

import {
  createDraftClaimInStoreWithExpiryTime,
  deleteDraftClaimFromStore,
  deleteDraftClaim,
  deleteFieldDraftClaimFromStore,
  findClaimIdsbyUserId,
  generateRedisKey,
  generateRedisKeyForGA,
  getCaseDataFromStore,
  getDraftClaimFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app-instance';
import {Claim} from 'models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {TTLCategory} from 'modules/draft-store/ttlConfig';

const REDIS_DATA = require('../../../../main/modules/draft-store/redisData.json');
const CLAIM_ID = '1645882162449409';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe.each([
  ['claim', 'id', generateRedisKey],
  ['general application', 'appId', generateRedisKeyForGA],
] as const)('%s draft key contract', (_journey, param, generateKey) => {
  const request = (resourceId: unknown, userId: unknown = USER_ID): AppRequest => ({
    params: {[param]: resourceId}, session: {user: {id: userId}},
  } as unknown as AppRequest);

  it.each([undefined, null, '', ' ', 'undefined', 'null', 'a b', '123\n', ['123']])(
    'rejects an invalid resource identifier (%p)', (id) => {
      expect(() => generateKey(request(id))).toThrow('Invalid draft resource identifier');
    },
  );

  it.each([undefined, null, '', ' ', 'undefined', 'null', 'abc', '3abc', '1' + USER_ID, USER_ID + '1', USER_ID + '\n', [USER_ID]])(
    'rejects an invalid user identifier (%p)', (userId) => {
      const req = request('123', userId);
      // Explicitly remove the id for undefined instead of using the helper's default.
      req.session.user.id = userId as string;
      expect(() => generateKey(req)).toThrow('Invalid draft user identifier');
    },
  );

  it('rejects missing authentication context', () => {
    expect(() => generateKey({params: {[param]: '123'}} as unknown as AppRequest))
      .toThrow('Invalid draft user identifier');
    expect(() => generateKey({params: {[param]: '123'}, session: {}} as AppRequest))
      .toThrow('Invalid draft user identifier');
  });

  it('keeps users and resources isolated with the existing fixed-width user suffix', () => {
    const otherUser = '550e8400-e29b-41d4-a716-446655440001';
    const keys = [generateKey(request('123')), generateKey(request('12')),
      generateKey(request('123', otherUser)), generateKey(request('12', otherUser))];
    expect(new Set(keys).size).toBe(4);
    expect(keys[0]).toBe('123' + USER_ID);
    expect(() => generateKey(request('12', '3' + USER_ID))).toThrow();
  });

  it('preserves opaque resource tokens without trimming or interpreting punctuation', () => {
    expect(generateKey(request('resource:with-punctuation'))).toBe('resource:with-punctuation' + USER_ID);
  });

  it('reads, updates and deletes a pre-existing key without migration or TTL reset', async () => {
    const resourceId = '1645882162449409';
    const legacyKey = resourceId + USER_ID;
    const otherKey = resourceId + '550e8400-e29b-41d4-a716-446655440001';
    const values = new Map([
      [legacyKey, JSON.stringify({case_data: {id: resourceId, totalClaimAmount: 100}})],
      [otherKey, JSON.stringify({case_data: {id: resourceId, totalClaimAmount: 200}})],
    ]);
    const store = {
      get: jest.fn(async (key: string) => values.get(key) ?? null),
      ttl: jest.fn(async () => 120),
      set: jest.fn(async (key: string, value: string) => values.set(key, value)),
      del: jest.fn(async (key: string) => values.delete(key)),
    };
    app.locals.draftStoreClient = store;
    const key = generateKey(request(resourceId));
    const claim = await getCaseDataFromStore(key);
    expect(claim.totalClaimAmount).toBe(100);
    claim.totalClaimAmount = 150;
    await saveDraftClaim(key, claim, false, USER_ID, TTLCategory.JOURNEY_CACHE);
    expect(store.set).toHaveBeenCalledWith(legacyKey, expect.any(String), 'KEEPTTL');
    expect((await getCaseDataFromStore(key)).totalClaimAmount).toBe(150);
    expect((await getCaseDataFromStore(otherKey)).totalClaimAmount).toBe(200);
    await deleteDraftClaimFromStore(key);
    expect(values.has(legacyKey)).toBe(false);
    expect(values.has(otherKey)).toBe(true);
  });
});

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(async () => JSON.stringify(REDIS_DATA[0])),
      set: jest.fn(async () => {
        return;
      }),
      on: jest.fn(async () => {
        return;
      }),
      ttl: jest.fn(() => Promise.resolve({})),
      expireat: jest.fn(() => Promise.resolve({})),
    };
  });
});

function createMockDraftStore(returnData: unknown) {
  return {
    get: jest.fn(async () => JSON.stringify(returnData)),
    set: jest.fn(async () => {
      return;
    }),
    del: jest.fn(async () => {
      return;
    }),
    ttl: jest.fn(() => Promise.resolve(60)),
    expireat: jest.fn(() => Promise.resolve({})),
  };
}

describe('Draft store service to save and retrieve claim', () => {
  it('should get claim data successfully when data exists', async () => {
    //Given
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const {id} = await getDraftClaimFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(id).toBe(Number(CLAIM_ID));
  });
  it('should get claim data when draft store client has no ttl method', async () => {
    app.locals.draftStoreClient = {
      get: jest.fn(async () => JSON.stringify(REDIS_DATA[0])),
    };
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    const {id} = await getDraftClaimFromStore(CLAIM_ID);
    expect(spyGet).toBeCalled();
    expect(id).toBe(Number(CLAIM_ID));
  });
  it('should return empty result if selected do not throw error', async () => {
    //Given
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get').mockResolvedValue(null);
    //When
    const {id} = await getDraftClaimFromStore(CLAIM_ID, true);
    //Then
    expect(spyGet).toBeCalled();
    expect(id).toBeUndefined();
  });
  it('should throw error if not selected do not throw error', async () => {
    //Given
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get').mockResolvedValue(null);
    //When
    //Then
    await expect(getDraftClaimFromStore(CLAIM_ID)).rejects.toThrowError('Case not found...');
    expect(spyGet).toBeCalled();
  });
  it('should return empty civil claim response when redis data is malformed', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(undefined);
    draftStoreWithData.get = jest.fn(async () => '{');
    app.locals.draftStoreClient = draftStoreWithData;
    //When
    const result = await getDraftClaimFromStore(CLAIM_ID);
    //Then
    expect(result.id).toBeUndefined();
  });
  it('should update existing claim when data exists', async () => {
    //Given
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    await saveDraftClaim(CLAIM_ID, new Claim());
    //Then
    expect(spyGet).toBeCalled();
    expect(spySet).toBeCalled();
  });
  it('should save new claim when data does not exists and if selected do not throw error', async () => {
    //Given
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get').mockResolvedValue(null);
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    await saveDraftClaim(CLAIM_ID, new Claim(), true);
    //Then
    expect(spyGet).toBeCalled();
    expect(spySet).toBeCalled();
  });
  it('should throw error when data does not exists and if not selected do not throw error', async () => {
    //Given
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get').mockResolvedValue(null);
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    //Then
    expect(saveDraftClaim(CLAIM_ID, new Claim())).rejects.toThrowError('Case not found...');
    expect(spyGet).toBeCalled();
    expect(spySet).toBeCalled();
  });
  it('should return case data when getting case data and data in redis exists', async () => {
    //Given
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA);
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const result = await getCaseDataFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(result).not.toBeUndefined();
  });
  it('should return undefined when getting case data and data in redis exists', async () => {
    //Given
    app.locals.draftStoreClient = createMockDraftStore(undefined);
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const result = await getCaseDataFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(result).toEqual({refreshDataForDJ: true});
  });
  it('should throw error if not selected do not throw error', async () => {
    //Given
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get').mockResolvedValue(null);
    //When
    //Then
    await expect(getCaseDataFromStore(CLAIM_ID)).rejects.toThrowError('Case not found...');
    expect(spyGet).toBeCalled();
  });
  it('should delete the claim successfully', async () => {
    //Given
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyDel = jest.spyOn(app.locals.draftStoreClient, 'del');
    //When
    await deleteDraftClaimFromStore(CLAIM_ID);
    //Then
    expect(spyDel).toBeCalled();
  });
  it('should create draft claim with expiry time', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(undefined);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(-1);
    app.locals.draftStoreClient = draftStoreWithData;
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    const spyExpireat = jest.spyOn(app.locals.draftStoreClient, 'expireat');
    //When
    await createDraftClaimInStoreWithExpiryTime(CLAIM_ID);
    //Then
    expect(spySet).toHaveBeenCalledWith(CLAIM_ID, expect.any(String), 'EX', expect.any(Number));
    const savedDraft = JSON.parse(spySet.mock.calls[0][1] as string);
    expect(savedDraft.case_data.draftClaimCacheTtlDays).toBe(30);
    expect(spyExpireat).not.toBeCalled();
  });
  it('should generate redis key', async () => {
    //Given
    const appReq = {params: {id: '12345'}, session: {user: {id: USER_ID}}} as unknown as AppRequest;
    //When
    const result = generateRedisKey(appReq);
    //Then
    expect(result).toBe('12345' + USER_ID);
  });

  it('should generate redis key for general application', async () => {
    //Given
    const appReq = {params: {appId: '67890'}, session: {user: {id: USER_ID}}} as unknown as AppRequest;
    //When
    const result = generateRedisKeyForGA(appReq);
    //Then
    expect(result).toBe('67890' + USER_ID);
  });

  it('should remove field from claim data and save on redis', async () => {
    //Given
    app.locals.draftStoreClient = createMockDraftStore(undefined);
    const mockClaim = new Claim();
    mockClaim.id = CLAIM_ID;
    mockClaim.totalClaimAmount = 123;

    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');

    //When
    await deleteFieldDraftClaimFromStore(CLAIM_ID,  mockClaim, 'totalClaimAmount');
    //Then
    expect(spySet).toHaveBeenCalledWith(
      CLAIM_ID,
      expect.stringContaining('"refreshDataForDJ":true'),
      'EX',
      expect.any(Number),
    );
    expect(mockClaim.draftClaimCreatedAt).toBeDefined();
  });

  describe('findClaimIdsbyUserId', () => {
    let mockKeys: jest.Mock;
    let mockDraftStoreClient: { keys: jest.Mock };
    const {Logger} = require('@hmcts/nodejs-logging');
    const logger = Logger.getLogger('draftStoreService');

    beforeEach(() => {
      mockKeys = jest.fn();
      mockDraftStoreClient = { keys: mockKeys };
      app.locals = {
        draftStoreClient: mockDraftStoreClient,
      };
      jest.clearAllMocks();
    });

    it('should return claim IDs for a given userId', async () => {
      const userId = '123';
      const mockResult = ['claim1', 'claim2'];
      mockKeys.mockResolvedValue(mockResult);
      const result = await findClaimIdsbyUserId(userId);
      expect(result).toEqual(mockResult);
      expect(mockKeys).toHaveBeenCalledWith('*' + userId);
    });

    it('should log an error and throw if the Redis client fails', async () => {
      const userId = '123';
      const mockError = new Error('Redis error');
      mockKeys.mockRejectedValue(mockError);
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation();
      await expect(findClaimIdsbyUserId(userId)).rejects.toThrow(mockError);
      expect(loggerSpy).toHaveBeenCalledWith('Failed to find claim IDs by userId', mockError);
    });
  });

  it('should not reset expiry when ttl is already set', async () => {
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(120);
    draftStoreWithData.expireat = jest.fn().mockResolvedValue({});
    app.locals.draftStoreClient = draftStoreWithData;

    const spyTtl = jest.spyOn(app.locals.draftStoreClient, 'ttl');
    const spyExpireat = jest.spyOn(app.locals.draftStoreClient, 'expireat');

    const claim = new Claim();
    claim.id = CLAIM_ID;
    claim.draftClaimCreatedAt = undefined as any;

    await saveDraftClaim(CLAIM_ID, claim);

    expect(spyTtl).toBeCalledWith(CLAIM_ID);
    expect(spyExpireat).not.toBeCalled();
  });

  it('should set draftClaimCreatedAt and expiry when saving a new draft claim', async () => {
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(-1);
    draftStoreWithData.expireat = jest.fn().mockResolvedValue({});
    app.locals.draftStoreClient = draftStoreWithData;

    const claim = new Claim();
    claim.id = CLAIM_ID;

    await saveDraftClaim(CLAIM_ID, claim);

    expect(claim.draftClaimCreatedAt).toBeDefined();
    expect(claim.draftClaimCacheTtlDays).toBeUndefined();
    expect(draftStoreWithData.set).toHaveBeenCalledWith(CLAIM_ID, expect.any(String), 'EX', expect.any(Number));
    expect(draftStoreWithData.expireat).not.toHaveBeenCalled();
  });

  it('should preserve stored draft ttl marker when saving an existing draft', async () => {
    const storedClaim = JSON.parse(JSON.stringify(REDIS_DATA[0]));
    storedClaim.case_data.draftClaimCreatedAt = new Date('2026-07-01T10:00:00.000Z').toISOString();
    storedClaim.case_data.draftClaimCacheTtlDays = 30;
    const draftStoreWithData = createMockDraftStore(storedClaim);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(120);
    app.locals.draftStoreClient = draftStoreWithData;

    const claim = new Claim();
    claim.id = CLAIM_ID;

    await saveDraftClaim(CLAIM_ID, claim);

    expect(claim.draftClaimCacheTtlDays).toBe(30);
  });

  it('should normalise an existing future draftClaimCreatedAt before saving', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-13T10:00:00.000Z'));
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(-1);
    app.locals.draftStoreClient = draftStoreWithData;

    const claim = new Claim();
    claim.id = CLAIM_ID;
    claim.draftClaimCreatedAt = new Date('2062-08-01T10:00:00.000Z');

    await saveDraftClaim(CLAIM_ID, claim);

    expect(claim.draftClaimCreatedAt).toEqual(new Date('2026-08-13T10:00:00.000Z'));
    jest.useRealTimers();
  });

  it('should normalise a stored future draftClaimCreatedAt before saving', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-13T10:00:00.000Z'));
    const storedClaim = JSON.parse(JSON.stringify(REDIS_DATA[0]));
    storedClaim.case_data.draftClaimCreatedAt = '2062-08-01T10:00:00.000Z';
    const draftStoreWithData = createMockDraftStore(storedClaim);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(-1);
    app.locals.draftStoreClient = draftStoreWithData;

    const claim = new Claim();
    claim.id = CLAIM_ID;

    await saveDraftClaim(CLAIM_ID, claim);

    expect(claim.draftClaimCreatedAt).toEqual(new Date('2026-08-13T10:00:00.000Z'));
    jest.useRealTimers();
  });

  it('should reconstruct draftClaimCreatedAt from existing TTL for legacy drafts without adding a new expiry notice marker', async () => {
    const storedClaim = JSON.parse(JSON.stringify(REDIS_DATA[0]));
    delete storedClaim.case_data.draftClaimCreatedAt;
    const draftStoreWithData = createMockDraftStore(storedClaim);
    const remainingTtlSeconds = 90 * 86400;
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(remainingTtlSeconds);
    draftStoreWithData.expireat = jest.fn().mockResolvedValue({});
    app.locals.draftStoreClient = draftStoreWithData;

    const claim = new Claim();
    claim.id = CLAIM_ID;

    const beforeSave = Date.now();
    await saveDraftClaim(CLAIM_ID, claim);
    const afterSave = Date.now();

    const expectedElapsedMs = (180 * 86400 - remainingTtlSeconds) * 1000;
    const createdAtMs = claim.draftClaimCreatedAt?.getTime() ?? 0;
    expect(createdAtMs).toBeGreaterThanOrEqual(beforeSave - expectedElapsedMs - 1000);
    expect(createdAtMs).toBeLessThanOrEqual(afterSave - expectedElapsedMs + 1000);
    expect(claim.draftClaimCacheTtlDays).toBeUndefined();
    expect(draftStoreWithData.expireat).not.toHaveBeenCalled();
  });

  it('should save journey cache without draft expiry metadata', async () => {
    const draftStoreWithData = createMockDraftStore(undefined);
    draftStoreWithData.ttl = jest.fn().mockResolvedValue(-1);
    app.locals.draftStoreClient = draftStoreWithData;

    const claim = new Claim();
    claim.id = CLAIM_ID;

    await saveDraftClaim(CLAIM_ID, claim, true, undefined, TTLCategory.JOURNEY_CACHE);

    expect(claim.draftClaimCreatedAt).toBeUndefined();
    expect(draftStoreWithData.set).toHaveBeenCalledWith(CLAIM_ID, expect.any(String), 'EX', expect.any(Number));
  });

  it('should delete draft claim using generated redis key when requested', async () => {
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    app.locals.draftStoreClient = draftStoreWithData;
    const appReq = {params: {id: 'draft-id'}, session: {user: {id: USER_ID}}} as unknown as AppRequest;

    await deleteDraftClaim(appReq, true);

    expect(draftStoreWithData.del).toHaveBeenCalledWith('draft-id' + USER_ID, undefined);
  });
});
