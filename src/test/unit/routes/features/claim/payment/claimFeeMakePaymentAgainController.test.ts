import {Response} from 'express';
import claimFeeMakePaymentAgainController from '../../../../../../main/routes/features/claim/payment/claimFeeMakePaymentAgainController';
import {AppRequest} from 'models/AppRequest';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/payment/claimFeeMakePaymentAgainService', () => ({
  getRedirectUrl: jest.fn(),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
}));

describe('Claim Fee - Make Payment Again', () => {
  const getHandler = getRouteHandler(claimFeeMakePaymentAgainController, 'get');
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetRedirectUrl = getRedirectUrl as jest.Mock;
  const mockSaveUserId = saveUserId as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetRedirectUrl.mockResolvedValue('https://govpay');
    mockSaveUserId.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should redirect the user to the govPay payment page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetRedirectUrl).toHaveBeenCalledWith(claimId, req);
      expect(mockSaveUserId).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, 'user-id');
      expect(res.redirect).toHaveBeenCalledWith('https://govpay');
    });

    it('should call next when getRedirectUrl fails', async () => {
      const error = new Error('error');
      mockGetRedirectUrl.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
