import {app} from '../../../../main/app';
import {
  saveUserId,
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
});
