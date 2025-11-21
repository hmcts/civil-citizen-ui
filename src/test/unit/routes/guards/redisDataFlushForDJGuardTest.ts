import { refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {redisDataFlushForDJ} from 'routes/guards/redisDataFlushForDJGuard';

jest.mock('modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
  generateRedisKey: jest.fn(() => 'mockRedisKey'),
}));

jest.mock('modules/utilityService', () => ({
  refreshDraftStoreClaimFrom: jest.fn(),
}));

describe('redisDataFlushForDJ', () => {
  const mockReq: any = {
    params: {id: 'test-case-id'},
    body: {},
  };

  const mockRes: any = {};
  const mockNext = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh and save the claim data when refreshDataForDJ is true', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue({id: 'test-case-id', refreshDataForDJ: true});

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(refreshDraftStoreClaimFrom).toHaveBeenCalledWith(mockReq, true);
    expect(saveDraftClaim).toHaveBeenCalledWith('mockRedisKey', {id: 'test-case-id', refreshDataForDJ: false});
    expect(mockNext).toHaveBeenCalled();
  });

  it('should not delete or refresh claim data when refreshDataForDJ is false', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: false});

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);
    expect(refreshDraftStoreClaimFrom).not.toHaveBeenCalled();
    expect(saveDraftClaim).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next with the error when an exception occurs', async () => {
    const mockError = new Error('Something went wrong');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(mockError);

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(getCaseDataFromStore).toHaveBeenCalledWith('mockRedisKey');
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
});
