import {
  createDraftClaimInStoreWithExpiryTime,
  deleteDraftClaimFromStore,
  deleteFieldDraftClaimFromStore,
  findClaimIdsbyUserId,
  generateRedisKey,
  getCaseDataFromStore,
  getDraftClaimFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import {Claim} from 'models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {req} from '../../../utils/UserDetails';

const REDIS_DATA = require('../../../../main/modules/draft-store/redisData.json');
const CLAIM_ID = '1645882162449409';

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
    expect(getDraftClaimFromStore(CLAIM_ID)).rejects.toThrowError('Case not found...');
    expect(spyGet).toBeCalled();
  });
  it('should update existing claim when data exists', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    app.locals.draftStoreClient = draftStoreWithData;
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
    const draftStoreWithData = createMockDraftStore(REDIS_DATA);
    app.locals.draftStoreClient = draftStoreWithData;
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const result = await getCaseDataFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(result).not.toBeUndefined();
  });
  it('should return undefined when getting case data and data in redis exists', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(undefined);
    app.locals.draftStoreClient = draftStoreWithData;
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
    expect(getCaseDataFromStore(CLAIM_ID)).rejects.toThrowError('Case not found...');
    expect(spyGet).toBeCalled();
  });
  it('should delete the claim successfully', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    app.locals.draftStoreClient = draftStoreWithData;
    const spyDel = jest.spyOn(app.locals.draftStoreClient, 'del');
    //When
    await deleteDraftClaimFromStore(CLAIM_ID);
    //Then
    expect(spyDel).toBeCalled();
  });
  it('should create draft claim with expiry time', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(undefined);
    app.locals.draftStoreClient = draftStoreWithData;
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    const spyExpireat = jest.spyOn(app.locals.draftStoreClient, 'expireat');
    //When
    await createDraftClaimInStoreWithExpiryTime(CLAIM_ID);
    //Then
    expect(spySet).toBeCalled();
    expect(spyExpireat).toBeCalled();
    expect(await app.locals.draftStoreClient.ttl(CLAIM_ID)).toBe(60);
  });
  it('should generate redis key', async () => {
    //Given
    const appReq = <AppRequest>req;
    appReq.params = {id: '12345'};
    //When
    const result = generateRedisKey(<AppRequest>req);
    //Then
    expect(result).toBe('123451');
  });

  it('should remove field from claim data and save on redis', async () => {
  // Given
    const draftStoreWithData = createMockDraftStore(undefined);
    app.locals.draftStoreClient = draftStoreWithData;

    const expectedClaim = {
      id: CLAIM_ID,
      case_data: {
        refreshDataForDJ: true,
        id: CLAIM_ID,
      },
    };

    const mockClaim = new Claim();
    mockClaim.id = CLAIM_ID;
    mockClaim.totalClaimAmount = 123;

    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');

    await deleteFieldDraftClaimFromStore(CLAIM_ID, mockClaim, 'totalClaimAmount');

    // compare objects, not raw JSON
    expect(spySet).toHaveBeenCalledTimes(1);

    const [keyArg, jsonArg] = spySet.mock.calls[0];
    expect(keyArg).toBe(CLAIM_ID);
    expect(JSON.parse(jsonArg)).toEqual(expectedClaim);
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
});
