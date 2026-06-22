process.env.NODE_ENV = 'test';
import './sharedMocks';
import {Claim} from '../../main/common/models/claim';
import {draftStoreServiceMock} from './sharedMocks';

beforeEach(() => {
  jest.clearAllMocks();
  draftStoreServiceMock.getCaseDataFromStore.mockResolvedValue(new Claim());
  draftStoreServiceMock.saveDraftClaim.mockResolvedValue(undefined);
  draftStoreServiceMock.updateFieldDraftClaimFromStore.mockResolvedValue(undefined);
  draftStoreServiceMock.generateRedisKey.mockReturnValue('test-redis-key');
});

