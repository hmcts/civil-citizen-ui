import {Request, Response} from 'express';
import paymentUnsuccessfulController from '../../../../../../main/routes/features/caseProgression/hearingFee/paymentUnsuccessfulController';
import {DASHBOARD_CLAIMANT_URL, HEARING_FEE_MAKE_PAYMENT_AGAIN_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

describe('Hearing Fees - Payment Unsuccessful', () => {
  const getHandler = getRouteHandler(paymentUnsuccessfulController, 'get');
  const postHandler = getRouteHandler(paymentUnsuccessfulController, 'post');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    jest.spyOn(claim, 'getFormattedCaseReferenceNumber').mockReturnValue('000MC001');
    mockGetClaimById.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the payment unsuccessful page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);
      await new Promise((resolve) => setImmediate(resolve));

      expect(res.render).toHaveBeenCalledWith(
        'features/caseProgression/hearingFee/payment-unsuccessful',
        {
          claimNumber: '000MC001',
          makePaymentAgainUrl: constructResponseUrlWithIdParams(claimId, HEARING_FEE_MAKE_PAYMENT_AGAIN_URL),
          noCrumbs: true,
        },
      );
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);
      await new Promise((resolve) => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the claimant dashboard', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    });
  });
});
