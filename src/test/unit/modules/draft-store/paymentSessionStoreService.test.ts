import {app} from '../../../../main/app';
import {
  saveUserId,
  getUserId,
  saveOriginalPaymentConfirmationUrl,
  getPaymentConfirmationUrl,
  deletePaymentConfirmationUrl,
  deleteUserId,
} from 'modules/draft-store/paymentSessionStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
  keys: jest.fn(),
  del: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;

describe('Payment session store service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftStoreClient.keys.mockResolvedValue([]);
  });

  it('should save the userId to the draft store and log the action', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    const userId = 'user123';

    await saveUserId(claimId, feeType, userId);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345HEARINGuserIdForPayment', userId);
  });

  it('should log a warning when overwriting an existing userId for a claimId', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    const existingUserId = 'user123';
    const newUserId = 'user456';
    mockDraftStoreClient.get.mockResolvedValueOnce(existingUserId);

    await saveUserId(claimId, feeType, newUserId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345HEARINGuserIdForPayment', newUserId);
    expect(mockDraftStoreClient.get).toHaveBeenCalledTimes(1);
  });

  it('should NOT log a warning when the same userId is saved for a claimId', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    const userId = 'user123';
    mockDraftStoreClient.get.mockResolvedValueOnce(userId);

    await saveUserId(claimId, feeType, userId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('12345HEARINGuserIdForPayment', userId);
    expect(mockDraftStoreClient.get).toHaveBeenCalledTimes(1);
  });

  it('should throw while save the userId to the draft store and log the action', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    const userId = 'user123';
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
    await expect(saveUserId(claimId, feeType, userId)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should get user id', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.get.mockResolvedValueOnce('user123');

    const result = await getUserId(claimId, feeType);

    expect(result).toBe('user123');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
  });

  it('should fallback to OLD key format if NEW key is not found', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.get.mockResolvedValueOnce(null); // New key miss
    mockDraftStoreClient.get.mockResolvedValueOnce('user123_old'); // Old key hit

    const result = await getUserId(claimId, feeType);

    expect(result).toBe('user123_old');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345userIdForPayment');
  });

  it('should NOT fallback to OLD key format if includeLegacyFallback is false', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.get.mockResolvedValueOnce(null); // New key miss

    const result = await getUserId(claimId, feeType, false);

    expect(result).toBeNull();
    expect(mockDraftStoreClient.get).toHaveBeenCalledTimes(1);
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
  });

  it('should save original payment confirmation url', async () => {
    const originalUrl = 'url/1234567890123456/';
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';

    await saveOriginalPaymentConfirmationUrl(claimId, feeType, userId, originalUrl);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl', originalUrl);
  });

  it('should log a warning when overwriting an existing payment confirmation url', async () => {
    const existingUrl = 'url/old/';
    const newUrl = 'url/new/';
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    mockDraftStoreClient.get.mockResolvedValueOnce(existingUrl);

    await saveOriginalPaymentConfirmationUrl(claimId, feeType, userId, newUrl);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl', newUrl);
  });

  it('should NOT log a warning when the same payment confirmation url is saved', async () => {
    const url = 'url/same/';
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    mockDraftStoreClient.get.mockResolvedValueOnce(url);

    await saveOriginalPaymentConfirmationUrl(claimId, feeType, userId, url);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl', url);
  });

  it('should get payment confirmation url', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    mockDraftStoreClient.get.mockResolvedValueOnce('url');

    const result = await getPaymentConfirmationUrl(claimId, feeType, userId);

    expect(result).toBe('url');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl');
  });

  it('should fallback to OLD key format for payment confirmation url', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    mockDraftStoreClient.get.mockResolvedValueOnce(null); // New key miss
    mockDraftStoreClient.get.mockResolvedValueOnce('url_old'); // Old key hit

    const result = await getPaymentConfirmationUrl(claimId, feeType, userId);

    expect(result).toBe('url_old');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl');
    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123userIdForPayment');
  });

  it('should isolate payment confirmation urls for different users on the same claim and fee type', async () => {
    const claimId = '1234567890123456';
    const feeType = FeeType.HEARING;
    const userIdOne = 'user123';
    const userIdTwo = 'user456';
    const urlOne = 'url/user-one';
    const urlTwo = 'url/user-two';

    await saveOriginalPaymentConfirmationUrl(claimId, feeType, userIdOne, urlOne);
    await saveOriginalPaymentConfirmationUrl(claimId, feeType, userIdTwo, urlTwo);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl', urlOne);
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456HEARINGuser456confirmationUrl', urlTwo);
  });

  it('should isolate payment confirmation urls for different fee types on the same claim and user', async () => {
    const claimId = '1234567890123456';
    const userId = 'user123';
    const claimFeeUrl = 'url/claim-fee';
    const hearingFeeUrl = 'url/hearing-fee';

    await saveOriginalPaymentConfirmationUrl(claimId, FeeType.CLAIMISSUED, userId, claimFeeUrl);
    await saveOriginalPaymentConfirmationUrl(claimId, FeeType.HEARING, userId, hearingFeeUrl);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456CLAIMISSUEDuser123confirmationUrl', claimFeeUrl);
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl', hearingFeeUrl);
  });

  it('should delete user id', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;

    await deleteUserId(claimId, feeType);

    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('12345HEARINGuserIdForPayment');
    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('12345userIdForPayment');
  });

  it('should delete payment confirmation url', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';

    await deletePaymentConfirmationUrl(claimId, feeType, userId);

    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('1234567890123456HEARINGuser123confirmationUrl');
    expect(mockDraftStoreClient.del).toHaveBeenCalledWith('user123userIdForPayment');
  });

  it('should log warning when user id is NOT found', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.get.mockResolvedValue(null);

    const result = await getUserId(claimId, feeType);

    expect(result).toBeNull();
  });

  it('should log warning when payment confirmation url is NOT found', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    mockDraftStoreClient.get.mockResolvedValue(null);

    const result = await getPaymentConfirmationUrl(claimId, feeType, userId);

    expect(result).toBeNull();
  });

  it('should throw error when getting user id fails', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.get.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(getUserId(claimId, feeType)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when deleting user id fails', async () => {
    const claimId = '12345';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.del.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(deleteUserId(claimId, feeType)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when saving original payment confirmation url fails', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    const url = 'url';
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(saveOriginalPaymentConfirmationUrl(claimId, feeType, userId, url)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when getting payment confirmation url fails', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    const claimId = '1234567890123456';
    mockDraftStoreClient.get.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(getPaymentConfirmationUrl(claimId, feeType, userId)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should throw error when deleting payment confirmation url fails', async () => {
    const userId = 'user123';
    const feeType = FeeType.HEARING;
    mockDraftStoreClient.del.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

    await expect(deletePaymentConfirmationUrl(undefined, feeType, userId)).rejects.toThrow(TestMessages.SOMETHING_WENT_WRONG);
  });
});
