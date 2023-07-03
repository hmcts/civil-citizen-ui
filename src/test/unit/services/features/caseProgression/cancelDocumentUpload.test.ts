import {cancelDocumentUpload} from 'services/features/caseProgression/cancelDocumentUpload';
import {app} from '../../../../../main/app';
import * as requestModels from 'models/AppRequest';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/utilityService');
const REDIS_DATA = require('../../../../../main/modules/draft-store/redisData.json');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;

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
    const mockGetClaimById = utilityService.getClaimById as jest.Mock;
    mockGetClaimById.mockImplementation(async () => {
      const claim = new Claim();
      claim.id = claimId;
      return claim;
    });
    app.locals.draftStoreClient = createMockDraftStore(REDIS_DATA[0]);
    const spyDel = jest.spyOn(app.locals.draftStoreClient, 'del');
    //When
    await cancelDocumentUpload(claimId, mockedAppRequest);
    //Then
    expect(spyDel).toBeCalled();
    expect(mockGetClaimById).toBeCalled();
  });
});
