import {Response} from 'express';
import paymentSuccessfulController from '../../../../../main/routes/features/claim/paymentSuccessfulController';
import {DASHBOARD_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimById} from 'modules/utilityService';
import {
  getPaymentSuccessfulBodyContent,
  getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/paymentSuccessfulContents';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/claim/paymentSuccessfulContents', () => ({
  getPaymentSuccessfulPanelContent: jest.fn((): unknown[] => []),
  getPaymentSuccessfulBodyContent: jest.fn((): unknown[] => []),
  getPaymentSuccessfulButtonContent: jest.fn((): unknown[] => []),
}));

describe('Hearing fee payment successful', () => {
  const getHandler = getRouteHandler(paymentSuccessfulController, 'get');
  const viewPath = 'features/claim/payment-successful';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(new Claim());
    (getPaymentSuccessfulPanelContent as jest.Mock).mockReturnValue([]);
    (getPaymentSuccessfulBodyContent as jest.Mock).mockReturnValue([]);
    (getPaymentSuccessfulButtonContent as jest.Mock).mockReturnValue([]);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(new Claim());
  });

  describe('on GET', () => {
    it('should render the payment successful page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        paymentSuccessfulPanel: [],
        paymentSuccessfulBody: [],
        paymentSuccessfulButton: [],
        pageTitle: 'PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.TITLE',
        noCrumbs: true,
      });
      expect(getPaymentSuccessfulButtonContent).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_URL));
    });

    it('should call next when retrieveClaimDetails fails', async () => {
      const error = new Error('error');
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});
