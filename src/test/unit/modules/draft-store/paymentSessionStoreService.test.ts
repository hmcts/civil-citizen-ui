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
    const feeType = 'HEARING';
    const userId = 'user123';

    await saveUserId(claimId, feeType, userId);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345HEARINGuserIdForPayment', userId);
  });

  it('should log a warning when overwriting an existing userId for a claimId', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    const existingUserId = 'user123';
    const newUserId = 'user456';
    mockDraftStoreClient.get.mockResolvedValueOnce(existingUserId);

    await saveUserId(claimId, feeType, newUserId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345HEARINGuserIdForPayment', newUserId);
  });

  it('should NOT log a warning when the same userId is saved for a claimId', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    const userId = 'user123';
    mockDraftStoreClient.get.mockResolvedValueOnce(userId);

    await saveUserId(claimId, feeType, userId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345HEARINGuserIdForPayment', userId);
  });

  it('should throw while save the userId to the draft store and log the action', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    const userId = 'user123';
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
    await expect(saveUserId(claimId, feeType, userId)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should get user id', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValueOnce('user123');

    const result = await getUserId(claimId, feeType);

    expect(result).toBe('user123');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
  });

  it('should fallback to OLD key format if NEW key is not found', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValueOnce(null); // New key miss
    mockDraftStoreClient.get.mockResolvedValueOnce('user123_old'); // Old key hit

    const result = await getUserId(claimId, feeType);

    expect(result).toBe('user123_old');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345userIdForPayment');
  });

  it('should save original payment confirmation url', async () => {
    const originalUrl = 'url/1234567890123456/';
    const userId = 'user123';
    const feeType = 'HEARING';

    await saveOriginalPaymentConfirmationUrl(userId, feeType, originalUrl);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123HEARINGconfirmationUrl', originalUrl);
  });

  it('should log a warning when overwriting an existing payment confirmation url', async () => {
    const existingUrl = 'url/old/';
    const newUrl = 'url/new/';
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValueOnce(existingUrl);

    await saveOriginalPaymentConfirmationUrl(userId, feeType, newUrl);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123HEARINGconfirmationUrl');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123HEARINGconfirmationUrl', newUrl);
  });

  it('should NOT log a warning when the same payment confirmation url is saved', async () => {
    const url = 'url/same/';
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValueOnce(url);

    await saveOriginalPaymentConfirmationUrl(userId, feeType, url);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123HEARINGconfirmationUrl');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123HEARINGconfirmationUrl', url);
  });

  it('should get payment confirmation url', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValueOnce('url');

    const result = await getPaymentConfirmationUrl(userId, feeType);

    expect(result).toBe('url');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123HEARINGconfirmationUrl');
  });

  it('should fallback to OLD key format for payment confirmation url', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValueOnce(null); // New key miss
    mockDraftStoreClient.get.mockResolvedValueOnce('url_old'); // Old key hit

    const result = await getPaymentConfirmationUrl(userId, feeType);

    expect(result).toBe('url_old');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123HEARINGconfirmationUrl');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123userIdForPayment');
  });

  it('should delete user id', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';

    await deleteUserId(claimId, feeType);

    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('12345userIdForPayment');
  });

  it('should delete payment confirmation url', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';

    await deletePaymentConfirmationUrl(userId, feeType);

    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('user123HEARINGconfirmationUrl');
    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('user123userIdForPayment');
  });

  it('should log warning when user id is NOT found', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValue(null);

    const result = await getUserId(claimId, feeType);

    expect(result).toBeNull();
  });

  it('should log warning when payment confirmation url is NOT found', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockResolvedValue(null);

    const result = await getPaymentConfirmationUrl(userId, feeType);

    expect(result).toBeNull();
  });

  it('should throw error when getting user id fails', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(getUserId(claimId, feeType)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when deleting user id fails', async () => {
    const claimId = '12345';
    const feeType = 'HEARING';
    mockDraftStoreClient.del.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(deleteUserId(claimId, feeType)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when saving original payment confirmation url fails', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';
    const url = 'url';
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(saveOriginalPaymentConfirmationUrl(userId, feeType, url)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when getting payment confirmation url fails', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.get.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(getPaymentConfirmationUrl(userId, feeType)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when deleting payment confirmation url fails', async () => {
    const userId = 'user123';
    const feeType = 'HEARING';
    mockDraftStoreClient.del.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(deletePaymentConfirmationUrl(userId, feeType)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });
});
