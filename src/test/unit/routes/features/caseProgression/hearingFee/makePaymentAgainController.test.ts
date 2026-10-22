import {Request, Response} from 'express';
import makePaymentAgainController from '../../../../../../main/routes/features/caseProgression/hearingFee/makePaymentAgainController';
import * as makePaymentAgainService from 'services/features/caseProgression/hearingFee/makePaymentAgainService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Hearing Fees - Make Payment Again', () => {
  const getHandler = getRouteHandler(makePaymentAgainController, 'get');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
  });

  it('should redirect to the payment URL from the service', async () => {
    jest.spyOn(makePaymentAgainService, 'getRedirectUrl').mockResolvedValue('https://govpay.example/pay');

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.redirect).toHaveBeenCalledWith('https://govpay.example/pay');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the service fails', async () => {
    const error = new Error('payment failed');
    jest.spyOn(makePaymentAgainService, 'getRedirectUrl').mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
