import {cancelDocumentUpload} from 'services/features/caseProgression/cancelDocumentUpload';
import {app} from '../../../../../main/app';
import {Claim} from 'models/claim';

const REDIS_DATA = require('../../../../../main/modules/draft-store/redisData.json');

function createMockDraftStore(returnData: unknown) {
  return {
    get: jest.fn(async () => JSON.stringify(returnData)),
    set: jest.fn(async () => {
      return;
    }),
    del: jest.fn(async () => {
      return;
    }),
  };
}

describe('cancelDocumentUpload', () => {
  it('should call draft store client to remove a claim with provided id and reimport it afresh from ccd', async () => {
    //Given
    const claimId = '1645882162449409';
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyDel = jest.spyOn(app.locals.draftStoreClient, 'del');
    const claimToReturn = new Claim();
    claimToReturn.id = claimId;
    //When
    await cancelDocumentUpload(claimId);
    //Then
    expect(spyDel).toBeCalled();
  });
});
