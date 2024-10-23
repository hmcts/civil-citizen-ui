import {app} from '../../../../main/app';
import {
  getPaymentConfirmationUrl,
  getUserId,
  saveOriginalPaymentConfirmationUrl,
  saveUserId
} from 'modules/draft-store/paymentSessionStoreService';

const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
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

  it('should save the original URL to the draft store for the user', async () => {
    const userId = 'user123';
    const originalUrl = 'http://example.com/payment-confirmation';

    await saveOriginalPaymentConfirmationUrl(userId, originalUrl);

    expect(mockDraftStoreClient.set).toHaveBeenCalledWith('user123userIdForPayment', originalUrl);
  });

  it('should return the userId from the draft store for a given claimId', async () => {
    const claimId = '12345';
    const expectedUserId = 'user123';

    mockDraftStoreClient.get.mockResolvedValue(expectedUserId);

    const result = await getUserId(claimId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('12345userIdForPayment');
    expect(result).toBe(expectedUserId);
  });

  it('should return the payment confirmation URL from the draft store for a given userId', async () => {
    const userId = 'user123';
    const expectedUrl = 'http://example.com/payment-confirmation';

    mockDraftStoreClient.get.mockResolvedValue(expectedUrl);

    const result = await getPaymentConfirmationUrl(userId);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith('user123userIdForPayment');
    expect(result).toBe(expectedUrl);
  });
});
