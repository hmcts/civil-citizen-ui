import {Response} from 'express';
import claimFeePaymentConfirmationController from '../../../../../../main/routes/features/claim/payment/claimFeePaymentConfirmationController';
import {CLAIM_FEE_PAYMENT_CONFIRMATION_URL, CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeePaymentConfirmationService';
import {deleteUserId} from 'modules/draft-store/paymentSessionStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/payment/claimFeePaymentConfirmationService', () => ({
  getRedirectUrl: jest.fn(),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  deleteUserId: jest.fn(),
}));

describe('Claim Fees - Payment Status', () => {
  const getHandler = getRouteHandler(claimFeePaymentConfirmationController, 'get');
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetRedirectUrl = getRedirectUrl as jest.Mock;
  const mockDeleteUserId = deleteUserId as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetRedirectUrl.mockResolvedValue('/payment-successful');
    mockDeleteUserId.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it.each([
      CLAIM_FEE_PAYMENT_CONFIRMATION_URL,
      CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
    ])('should redirect the user to the success or failure page when url is %s', async () => {
      const handler = getRouteHandler(claimFeePaymentConfirmationController, 'get');

      await handler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetRedirectUrl).toHaveBeenCalledWith(claimId, req);
      expect(mockDeleteUserId).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, '/payment-successful'));
    });

    it('should call next when getRedirectUrl fails', async () => {
      const error = new Error('error');
      mockGetRedirectUrl.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
