import {app} from '../../../../main/app';
import {
  saveUserId,
} from 'modules/draft-store/paymentSessionStoreService';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

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

  it('should throw while save the userId to the draft store and log the action', async () => {
    const claimId = '12345';
    const userId = 'user123';
    mockDraftStoreClient.set.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
    await saveUserId(claimId, userId).catch((err: Error) => {
      expect(err.message).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
