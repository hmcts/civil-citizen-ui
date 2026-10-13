import {Response} from 'express';
import claimFeeBreakDownController from '../../../../../../main/routes/features/claim/payment/claimFeeBreakDownController';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {getClaimBusinessProcess, getClaimById} from 'modules/utilityService';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getClaimBusinessProcess: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
}));
jest.mock('services/features/feePayment/feePaymentService', () => ({
  getFeePaymentRedirectInformation: jest.fn(),
  getFeePaymentStatus: jest.fn(),
}));
jest.mock('common/utils/interestUtils', () => ({
  calculateInterestToDate: jest.fn(),
}));

describe('Claim fee breakdown', () => {
  const getHandler = getRouteHandler(claimFeeBreakDownController, 'get');
  const postHandler = getRouteHandler(claimFeeBreakDownController, 'post');
  const viewPath = 'features/claim/payment/claim-fee-breakdown';
  const claimId = '111111';
  const paymentUrl = 'paymentUrl';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetClaimBusinessProcess = getClaimBusinessProcess as jest.Mock;
  const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
  const mockGetFeePaymentRedirectInformation = getFeePaymentRedirectInformation as jest.Mock;
  const mockGetFeePaymentStatus = getFeePaymentStatus as jest.Mock;
  const mockCalculateInterestToDate = calculateInterestToDate as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    claim.claimInterest = YesNo.YES;
    claim.claimFee = {calculatedAmountInPence: 10000} as Claim['claimFee'];
    claim.claimDetails = new ClaimDetails();
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(buildClaim());
    mockGetClaimBusinessProcess.mockResolvedValue({hasBusinessProcessFinished: () => true});
    mockGetCaseDataFromStore.mockResolvedValue(buildClaim());
    mockGenerateRedisKey.mockReturnValue('redis-key');
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockCalculateInterestToDate.mockResolvedValue(100);
    mockGetFeePaymentRedirectInformation.mockResolvedValue({nextUrl: paymentUrl});
    mockGetFeePaymentStatus.mockResolvedValue({status: 'Initiated'});
  });

  describe('on GET', () => {
    it('should render fee summary details when business process has finished', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        totalClaimAmount: '1000.00',
        interest: 100,
        claimFee: 100,
        hasInterest: true,
        totalAmount: '1200.00',
        pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
        paymentSyncError: false,
        hasBusinessProcessFinished: true,
      });
    });

    it('should render fee summary details when business process has not finished', async () => {
      mockGetClaimBusinessProcess.mockResolvedValue({hasBusinessProcessFinished: () => false});

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        hasBusinessProcessFinished: false,
        pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the payment URL when there is no existing payment reference', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
    });

    it('should redirect to the fee breakdown page when the payment request fails', async () => {
      mockGetFeePaymentRedirectInformation.mockRejectedValue(new Error('something went wrong'));

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
    });

    it('should redirect to confirmation url if already paid', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'status');
      mockGetCaseDataFromStore.mockResolvedValue(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Success'});

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_PAYMENT_CONFIRMATION_URL));
    });

    it('should get a new payment ref if previous payment failed', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'Failed');
      mockGetCaseDataFromStore.mockResolvedValue(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Failed'});
      mockGetFeePaymentRedirectInformation.mockResolvedValue({nextUrl: paymentUrl});

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
    });

    it('should redirect to the fee breakdown page if previous payment failed and no payment data is returned', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'Failed');
      mockGetCaseDataFromStore.mockResolvedValue(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Failed'});
      mockGetFeePaymentRedirectInformation.mockResolvedValue(undefined);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
    });

    it('should redirect to payment if payment status cannot be retrieved', async () => {
      mockGetFeePaymentStatus.mockRejectedValue(new Error('something went wrong'));

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
    });
  });
});
