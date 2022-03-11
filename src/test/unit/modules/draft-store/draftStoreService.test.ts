import {
  getDraftClaimFromStore,
  saveDraftClaim,
  getCaseDataFromStore,
} from '../../../../main/modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import {Claim} from '../../../../main/common/models/claim';

const REDIS_DATA = require('../../../../main/modules/draft-store/redisData.json');
const CLAIM_ID = '1645882162449409';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(async () => JSON.stringify(REDIS_DATA)),
      set: jest.fn(async () => {return;}),
    };
  });
});
function createMockDraftStore( returnData: any){
  return {
    get: jest.fn(async () => JSON.stringify(returnData)),
    set: jest.fn(async () => {return;}),
  };
}

describe('Draft store service to save and retrieve claim', ()=> {
  it('should get claim data successfully when data exists', async ()=> {
    //Given
    const draftStoreWithData = createMockDraftStore(REDIS_DATA);
    app.locals.draftStoreClient = draftStoreWithData;
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const {id} = await getDraftClaimFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(id).toBe(Number(CLAIM_ID));
  });
  it('should return empty result', async ()=> {
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
  it('should update existing claim when data exists', async ()=> {
    //Given
    const draftStoreWithData = createMockDraftStore(REDIS_DATA);
    app.locals.draftStoreClient = draftStoreWithData;
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    const spySet = jest.spyOn(app.locals.draftStoreClient, 'set');
    //When
    await saveDraftClaim(CLAIM_ID, new Claim());
    //Then
    expect(spyGet).toBeCalled();
    expect(spySet).toBeCalled();
  });
  it('should save new claim when data does not exists', async ()=> {
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
  it('should return case data when getting case data and data in redis exists', async ()=> {
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
  it('should return undefined when getting case data data in redis exists', async ()=> {
    //Given
    const draftStoreWithData = createMockDraftStore(null);
    app.locals.draftStoreClient = draftStoreWithData;
    const spyGet = jest.spyOn(app.locals.draftStoreClient, 'get');
    //When
    const result = await getCaseDataFromStore(CLAIM_ID);
    //Then
    expect(spyGet).toBeCalled();
    expect(result).toBeUndefined();
  });
});
