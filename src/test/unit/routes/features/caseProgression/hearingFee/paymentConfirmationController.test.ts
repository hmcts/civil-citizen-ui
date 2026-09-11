import {Request, Response} from 'express';
import paymentConfirmationController from '../../../../../../main/routes/features/caseProgression/hearingFee/paymentConfirmationController';
import * as paymentConfirmationService from 'services/features/caseProgression/hearingFee/paymentConfirmationService';
import {deleteUserId} from 'modules/draft-store/paymentSessionStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {PAY_HEARING_FEE_SUCCESSFUL_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  deleteUserId: jest.fn().mockResolvedValue(undefined),
}));

describe('Hearing Fees - Payment Status', () => {
  const getHandler = getRouteHandler(paymentConfirmationController, 'get');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should delete the payment session and redirect to the confirmation URL', async () => {
    jest.spyOn(paymentConfirmationService, 'getRedirectUrl').mockResolvedValue(PAY_HEARING_FEE_SUCCESSFUL_URL);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(deleteUserId).toHaveBeenCalledWith(claimId, FeeType.HEARING);
    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, PAY_HEARING_FEE_SUCCESSFUL_URL));
  });

  it('should call next when the confirmation service fails', async () => {
    const error = new Error('confirmation failed');
    jest.spyOn(paymentConfirmationService, 'getRedirectUrl').mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
