import {Response} from 'express';
import claimFeeBreakDownController from '../../../../../../main/routes/features/claim/payment/claimFeeBreakDownController';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {getClaimBusinessProcess} from 'modules/utilityService';
import {
  getClaimIssuePaymentClaim,
  saveClaimIssuePaymentClaim,
} from '../../../../../../main/routes/features/claim/payment/claimIssuePaymentDraftService';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimBusinessProcess: jest.fn(),
}));
jest.mock('../../../../../../main/routes/features/claim/payment/claimIssuePaymentDraftService', () => ({
  getClaimIssuePaymentClaim: jest.fn(),
  saveClaimIssuePaymentClaim: jest.fn(),
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
  const draftId = 'draft-123';
  const paymentUrl = 'paymentUrl';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let savedClaims: Claim[];
  const mockGetClaimBusinessProcess = getClaimBusinessProcess as jest.Mock;
  const mockGetClaimIssuePaymentClaim = getClaimIssuePaymentClaim as jest.Mock;
  const mockSaveClaimIssuePaymentClaim = saveClaimIssuePaymentClaim as jest.Mock;
  const mockGetFeePaymentRedirectInformation = getFeePaymentRedirectInformation as jest.Mock;
  const mockGetFeePaymentStatus = getFeePaymentStatus as jest.Mock;
  const mockCalculateInterestToDate = calculateInterestToDate as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    claim.claimInterest = YesNo.YES;
    claim.claimFee = {calculatedAmountInPence: 10000, code: 'test-fee', version: 1};
    claim.claimDetails = new ClaimDetails();
    claim.draftClaimCreatedAt = new Date('2026-01-02T09:00:00.000Z');
    claim.draftClaimCacheTtlDays = 30;
    return claim;
  };

  const mockDraft = (claim: Claim) => {
    mockGetClaimIssuePaymentClaim.mockResolvedValue({claim, draftId});
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    savedClaims = [];
    mockDraft(buildClaim());
    mockGetClaimBusinessProcess.mockResolvedValue({hasBusinessProcessFinished: () => true});
    mockSaveClaimIssuePaymentClaim.mockImplementation(async (_req: AppRequest, claim: Claim) => {
      savedClaims.push(JSON.parse(JSON.stringify(claim)));
    });
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
      mockGetClaimIssuePaymentClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should clear the payment sync error and save the claim without a draftId when loaded from Redis', async () => {
      const claim = buildClaim();
      claim.paymentSyncError = true;
      mockGetClaimIssuePaymentClaim.mockResolvedValue({claim});

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.paymentSyncError).toBeUndefined();
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledWith(req, claim, undefined);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        paymentSyncError: true,
      }));
    });
  });

  describe('on POST', () => {
    const unusableUrls = [undefined, null, '', '   '];
    const expectFeePageRecovery = () => {
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
      expect(next).not.toHaveBeenCalled();
      expect(saveUserId).toHaveBeenCalledTimes(1);
      expect(saveUserId).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, 'user-id');
    };

    it('should redirect to the payment URL when there is no existing payment reference', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledWith(req, expect.any(Claim), draftId);
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
      mockDraft(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Success'});

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_PAYMENT_CONFIRMATION_URL));
    });

    it('should get a new payment ref if previous payment failed', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'Failed');
      mockDraft(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Failed'});
      mockGetFeePaymentRedirectInformation.mockResolvedValue({nextUrl: paymentUrl});

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledTimes(2);
      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
    });

    it('should redirect to the fee breakdown page if previous payment failed and no payment data is returned', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'Failed');
      mockDraft(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Failed'});
      mockGetFeePaymentRedirectInformation.mockResolvedValue(undefined);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
    });

    it('should redirect to payment if payment status cannot be retrieved', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'Initiated', paymentUrl);
      mockDraft(claim);
      mockGetFeePaymentStatus.mockRejectedValue(new Error('something went wrong'));

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
      expect(mockGetFeePaymentStatus).toHaveBeenCalledWith(claimId, claim.claimDetails.claimFeePayment.paymentReference, FeeType.CLAIMISSUED, req);
      expect(mockGetFeePaymentRedirectInformation).not.toHaveBeenCalled();
    });

    it.each(unusableUrls)('should recover when new payment information has no reference and URL %p', async nextUrl => {
      const claim = buildClaim();
      const payment = new PaymentInformation('external-new', undefined, 'Initiated', nextUrl);
      const expectedClaim = JSON.parse(JSON.stringify(claim));
      expectedClaim.claimDetails.claimFeePayment = JSON.parse(JSON.stringify(payment));
      mockDraft(claim);
      mockGetFeePaymentRedirectInformation.mockResolvedValue(payment);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expectFeePageRecovery();
      expect(mockGetFeePaymentStatus).not.toHaveBeenCalled();
      expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledTimes(1);
      expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, req);
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledWith(req, claim, draftId);
      expect(savedClaims).toEqual([expectedClaim]);
    });

    it.each(unusableUrls)('should recover when a pending stored payment has URL %p', async nextUrl => {
      const claim = buildClaim();
      const payment = new PaymentInformation('external-stored', 'RC-1234-1234-1234-1234', 'Initiated', nextUrl);
      claim.claimDetails.claimFeePayment = payment;
      const expectedClaim = JSON.parse(JSON.stringify(claim));
      mockDraft(claim);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expectFeePageRecovery();
      expect(mockGetFeePaymentRedirectInformation).not.toHaveBeenCalled();
      expect(mockGetFeePaymentStatus).toHaveBeenCalledTimes(1);
      expect(mockGetFeePaymentStatus).toHaveBeenCalledWith(claimId, payment.paymentReference, FeeType.CLAIMISSUED, req);
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledWith(req, claim, draftId);
      expect(savedClaims).toEqual([expectedClaim]);
    });

    it.each(unusableUrls)('should recover when a failed payment replacement has URL %p', async nextUrl => {
      const claim = buildClaim();
      const oldPayment = new PaymentInformation('external-old', 'RC-1234-1234-1234-1234', 'Failed');
      const replacement = new PaymentInformation('external-new', 'RC-5678-5678-5678-5678', 'Initiated', nextUrl);
      claim.claimDetails.claimFeePayment = oldPayment;
      const expectedBeforeReplacement = JSON.parse(JSON.stringify(claim));
      const expectedAfterReplacement = JSON.parse(JSON.stringify(claim));
      expectedAfterReplacement.claimDetails.claimFeePayment = JSON.parse(JSON.stringify(replacement));
      mockDraft(claim);
      mockGetFeePaymentStatus.mockResolvedValue({status: 'Failed'});
      mockGetFeePaymentRedirectInformation.mockResolvedValue(replacement);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expectFeePageRecovery();
      expect(mockGetFeePaymentStatus).toHaveBeenCalledTimes(1);
      expect(mockGetFeePaymentStatus).toHaveBeenCalledWith(claimId, oldPayment.paymentReference, FeeType.CLAIMISSUED, req);
      expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledTimes(1);
      expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, req);
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledTimes(2);
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenNthCalledWith(1, req, claim, draftId);
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenNthCalledWith(2, req, claim, draftId);
      expect(savedClaims).toEqual([expectedBeforeReplacement, expectedAfterReplacement]);
    });

    it.each(unusableUrls)('should recover when status lookup fails and the stored payment has URL %p', async nextUrl => {
      const claim = buildClaim();
      const payment = new PaymentInformation('external-stored', 'RC-1234-1234-1234-1234', 'Initiated', nextUrl);
      claim.claimDetails.claimFeePayment = payment;
      const expectedClaim = JSON.parse(JSON.stringify(claim));
      mockDraft(claim);
      mockGetFeePaymentStatus.mockRejectedValue(new Error('status unavailable'));

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expectFeePageRecovery();
      expect(mockGetFeePaymentStatus).toHaveBeenCalledTimes(1);
      expect(mockGetFeePaymentStatus).toHaveBeenCalledWith(claimId, payment.paymentReference, FeeType.CLAIMISSUED, req);
      expect(mockGetFeePaymentRedirectInformation).not.toHaveBeenCalled();
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledWith(req, claim, draftId);
      expect(savedClaims).toEqual([expectedClaim]);
    });

    it.each([undefined, null, '', '   ', 'undefined', 'null'])('should never look up payment status for reference %p', async paymentReference => {
      mockGetFeePaymentRedirectInformation.mockResolvedValue(new PaymentInformation('', paymentReference, 'Initiated'));

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expectFeePageRecovery();
      expect(mockGetFeePaymentStatus).not.toHaveBeenCalled();
      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledTimes(1);
    });

    it('should retain a pending stored payment provider URL', async () => {
      const claim = buildClaim();
      claim.claimDetails.claimFeePayment = new PaymentInformation('', 'RC-1234-1234-1234-1234', 'Initiated', paymentUrl);
      mockDraft(claim);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
      expect(mockGetFeePaymentRedirectInformation).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should save payment information without a draftId when the claim was loaded from Redis', async () => {
      const claim = buildClaim();
      mockGetClaimIssuePaymentClaim.mockResolvedValue({claim});

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimIssuePaymentClaim).toHaveBeenCalledWith(req, claim, undefined);
      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
    });
  });
});
