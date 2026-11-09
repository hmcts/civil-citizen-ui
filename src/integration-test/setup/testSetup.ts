process.env.NODE_ENV = 'test';
import './sharedMocks';
import {Claim} from '../../main/common/models/claim';
import {draftStoreServiceMock} from './sharedMocks';

beforeEach(() => {
  jest.clearAllMocks();
  draftStoreServiceMock.getCaseDataFromStore.mockResolvedValue(new Claim());
  draftStoreServiceMock.getDraftClaimFromStore.mockResolvedValue({id: 'test-draft'});
  draftStoreServiceMock.saveDraftClaim.mockResolvedValue(undefined);
  draftStoreServiceMock.createDraftClaimInStoreWithExpiryTime.mockResolvedValue(undefined);
  draftStoreServiceMock.deleteDraftClaimFromStore.mockResolvedValue(undefined);
  draftStoreServiceMock.updateFieldDraftClaimFromStore.mockResolvedValue(undefined);
  draftStoreServiceMock.generateRedisKey.mockReturnValue('test-redis-key');
});

