import {
  createDraftClaimInStoreWithExpiryTime,
  deleteDraftClaimFromStore,
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
    const draftStoreWithData = createMockDraftStore(REDIS_DATA[0]);
    app.locals.draftStoreClient = draftStoreWithData;
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
    expect(result).toEqual({});
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
});
