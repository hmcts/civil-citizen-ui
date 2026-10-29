import { refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
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
    session: { user: {id : 'test-user-id'}},
  };

  const mockRes: any = {};
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(generateRedisKey).mockReturnValue('mockRedisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue({id: 'test-case-id', refreshDataForDJ: true});
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
  });

  it('should refresh and save the claim data when refreshDataForDJ is true', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue({id: 'test-case-id', refreshDataForDJ: true});

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(refreshDraftStoreClaimFrom).toHaveBeenCalledWith(mockReq, true);
    expect(saveDraftClaim).toHaveBeenCalledWith('mockRedisKey', {id: 'test-case-id', refreshDataForDJ: false}, false, 'test-user-id');
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
    expect(refreshDraftStoreClaimFrom).not.toHaveBeenCalled();
    expect(saveDraftClaim).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });

  it('forwards a refresh failure without saving or continuing successfully', async () => {
    const error = new Error('refresh failed');
    jest.mocked(refreshDraftStoreClaimFrom).mockRejectedValue(error);

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(refreshDraftStoreClaimFrom).toHaveBeenCalledTimes(1);
    expect(refreshDraftStoreClaimFrom).toHaveBeenCalledWith(mockReq, true);
    expect(saveDraftClaim).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('forwards the final save failure without continuing successfully', async () => {
    const error = new Error('save failed');
    jest.mocked(saveDraftClaim).mockRejectedValue(error);

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(refreshDraftStoreClaimFrom).toHaveBeenCalledTimes(1);
    expect(saveDraftClaim).toHaveBeenCalledTimes(1);
    expect(saveDraftClaim).toHaveBeenCalledWith('mockRedisKey', {id: 'test-case-id', refreshDataForDJ: false}, false, 'test-user-id');
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
