import {Response} from 'express';
import applicationFeePaymentConfirmationController from '../../../../../../../main/routes/features/generalApplication/payment/applicationFeePaymentConfirmationController';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getRedirectUrl} from 'services/features/generalApplication/payment/applicationFeePaymentConfirmationService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/paymentSessionStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('services/features/generalApplication/payment/applicationFeePaymentConfirmationService', () => ({
  getRedirectUrl: jest.fn(),
}));

describe('application Fees - Payment Status', () => {
  const getHandler = getRouteHandler(applicationFeePaymentConfirmationController, 'get');
  const claimId = '12345';
  const appId = '67890';
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetRedirectUrl = getRedirectUrl as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
    mockGetRedirectUrl.mockResolvedValue('12354');
  });

  describe('on GET', () => {
    it('should redirect to the payment status page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, '12354'),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when the payment status lookup fails', async () => {
      const error = new Error('redis failure');
      mockGetRedirectUrl.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
