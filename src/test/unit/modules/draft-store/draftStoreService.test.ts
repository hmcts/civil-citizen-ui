import {
  deleteDraftClaimFromStore,
  getCaseDataFromStore,
  getDraftClaimFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import {Claim} from 'models/claim';

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
      expire: jest.fn(async () => {
        return;
      }),
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
    expire: jest.fn(async () => {
      return;
    }),
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

  it('should return empty result', async () => {
    //Given
    const draftStoreWithNoData = createMockDraftStore(null);
    app.locals.draftStoreClient = draftStoreWithNoData;
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const {id} = await getDraftClaimFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(id).toBeUndefined();
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

  it('should save new claim when data does not exists', async () => {
    //Given
    const draftStoreWithNoData = createMockDraftStore(null);
    app.locals.draftStoreClient = draftStoreWithNoData;
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    await saveDraftClaim(CLAIM_ID, new Claim());
    //Then
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

  it('should expire date be in 180 days', async () => {
    //Given
    const draftStoreWithData = createMockDraftStore(undefined);
    app.locals.draftStoreClient = draftStoreWithData;
    const spyTTL = jest.spyOn(app.locals.draftStoreClient, 'expire');
    //When
    const claimId = '1645882162449409';
    const claim: Claim = new Claim();
    claim.createAt = new Date('2023-07-12T12:23:34.123');
    await saveDraftClaim(claimId, claim);
    //Then
    expect(spyTTL).toBeCalled();
  });
});
