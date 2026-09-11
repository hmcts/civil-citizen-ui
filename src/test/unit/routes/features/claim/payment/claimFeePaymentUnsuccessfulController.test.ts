import {Response} from 'express';
import paymentUnsuccessfulController from '../../../../../../main/routes/features/claim/payment/claimFeePaymentUnsuccessfulController';
import {CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
}));

describe('Claim fee payment unsuccessful', () => {
  const getHandler = getRouteHandler(paymentUnsuccessfulController, 'get');
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    jest.spyOn(claim, 'getFormattedCaseReferenceNumber').mockReturnValue('000MC001');
    mockGetCaseDataFromStore.mockResolvedValue(claim);
    mockGenerateRedisKey.mockReturnValue('redis-key');
  });

  describe('on GET', () => {
    it('should render the payment unsuccessful page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(
        'features/caseProgression/hearingFee/payment-unsuccessful',
        {
          claimNumber: '000MC001',
          makePaymentAgainUrl: constructResponseUrlWithIdParams(claimId, CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL),
          pageTitle: 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.UNSUCCESSFUL.PAGE_TITLE',
          noCrumbs: true,
        },
      );
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseDataFromStore.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
