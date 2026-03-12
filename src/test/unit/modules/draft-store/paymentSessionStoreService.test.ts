import {app} from '../../../../main/app';
import {
  saveUserId,
  getUserId,
  saveOriginalPaymentConfirmationUrl,
  getPaymentConfirmationUrl,
  deletePaymentConfirmationUrl,
  deleteUserId,
} from 'modules/draft-store/paymentSessionStoreService';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;

describe('Payment session store service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save the userId to the draft store and log the action', async () => {
    const claimId = '12345';
    const userId = 'user123';

    await saveUserId(claimId, userId);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345userIdForPayment', userId);
  });

  it('should log a warning when overwriting an existing userId for a claimId', async () => {
    const claimId = '12345';
    const existingUserId = 'user123';
    const newUserId = 'user456';
    mockDraftStoreClient.get.mockResolvedValueOnce(existingUserId);

    await saveUserId(claimId, newUserId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345userIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345userIdForPayment', newUserId);
  });

  it('should NOT log a warning when the same userId is saved for a claimId', async () => {
    const claimId = '12345';
    const userId = 'user123';
    mockDraftStoreClient.get.mockResolvedValueOnce(userId);

    await saveUserId(claimId, userId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345userIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345userIdForPayment', userId);
  });

  it('should throw while save the userId to the draft store and log the action', async () => {
    const claimId = '12345';
    const userId = 'user123';
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
    await expect(saveUserId(claimId, userId)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should get user id', async () => {
    const claimId = '12345';
    mockDraftStoreClient.get.mockResolvedValueOnce('user123');

    const result = await getUserId(claimId);

    expect(result).toBe('user123');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345userIdForPayment');
  });

  it('should save original payment confirmation url', async () => {
    const originalUrl = 'url/1234567890123456/';
    const userId = 'user123';

    await saveOriginalPaymentConfirmationUrl(userId, originalUrl);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123userIdForPayment', originalUrl);
  });

  it('should log a warning when overwriting an existing payment confirmation url', async () => {
    const existingUrl = 'url/old/';
    const newUrl = 'url/new/';
    const userId = 'user123';
    mockDraftStoreClient.get.mockResolvedValueOnce(existingUrl);

    await saveOriginalPaymentConfirmationUrl(userId, newUrl);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123userIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123userIdForPayment', newUrl);
  });

  it('should NOT log a warning when the same payment confirmation url is saved', async () => {
    const url = 'url/same/';
    const userId = 'user123';
    mockDraftStoreClient.get.mockResolvedValueOnce(url);

    await saveOriginalPaymentConfirmationUrl(userId, url);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123userIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123userIdForPayment', url);
  });

  it('should get payment confirmation url', async () => {
    const userId = 'user123';
    mockDraftStoreClient.get.mockResolvedValueOnce('url');

    const result = await getPaymentConfirmationUrl(userId);

    expect(result).toBe('url');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123userIdForPayment');
  });

  it('should delete user id', async () => {
    const claimId = '12345';

    await deleteUserId(claimId);

    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('12345userIdForPayment');
  });

  it('should delete payment confirmation url', async () => {
    const userId = 'user123';

    await deletePaymentConfirmationUrl(userId);

    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('user123userIdForPayment');
  });
});
