import {getRedirectUrl} from 'services/features/claim/payment/claimFeePaymentConfirmationService';
import {getDraftClaim, deleteDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {isWelshEnabledForMainCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PAY_CLAIM_FEE_SUCCESSFUL_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL, DASHBOARD_URL} from 'routes/urls';

jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('services/features/feePayment/feePaymentService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockDeleteDraftClaim = deleteDraftClaim as jest.Mock;
const mockGetFeePaymentStatus = getFeePaymentStatus as jest.Mock;
const mockIsWelshEnabledForMainCase = isWelshEnabledForMainCase as jest.Mock;

const claimId = '1';
const paymentReference = 'RC-1701-0909-0602-0418';
const sessionDraftId = 'session-draft-id';
const rawResponseDraftId = 'raw-response-draft-id';

const createReq = (draftId?: string): AppRequest => ({
  params: {id: '123'},
  session: {
    draftId,
    user: {id: 'user-id'},
  },
} as unknown as AppRequest);

const createClaim = (languagePreference?: ClaimBilingualLanguagePreference): Claim => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.claimFeePayment = {paymentReference};
  if (languagePreference) {
    claim.claimantBilingualLanguagePreference = languagePreference;
  }
  return claim;
};

const createMockManagerResult = (claim: Claim, draftId = rawResponseDraftId): DraftClaimManagerResult => ({
  claimResponse: {
    id: draftId,
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId,
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

const successPaymentStatus = {
  status: 'Success',
  nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
  externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
  paymentReference,
};

describe('Claim Fee PaymentConfirmation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteDraftClaim.mockResolvedValue(undefined);
    mockIsWelshEnabledForMainCase.mockResolvedValue(true);
  });

  it('should return to payment successful screen if payment is successful and delete the draft', async () => {
    const req = createReq(sessionDraftId);
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(createClaim()));
    mockGetFeePaymentStatus.mockResolvedValueOnce(successPaymentStatus);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(mockGetDraftClaim).toHaveBeenCalledWith(req);
    expect(mockGetFeePaymentStatus).toHaveBeenCalledWith(claimId, paymentReference, FeeType.CLAIMISSUED, req);
    expect(mockDeleteDraftClaim).toHaveBeenCalledWith(req, sessionDraftId);
    expect(req.session.draftId).toBeUndefined();
    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=en`);
  });

  it('should delete using rawResponse.draftId when session.draftId is missing', async () => {
    const req = createReq();
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(createClaim(), rawResponseDraftId));
    mockGetFeePaymentStatus.mockResolvedValueOnce(successPaymentStatus);

    await getRedirectUrl(claimId, req);

    expect(mockDeleteDraftClaim).toHaveBeenCalledWith(req, rawResponseDraftId);
  });

  it('should redirect with lang=cy when claimant language preference is Welsh', async () => {
    const req = createReq(sessionDraftId);
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(createClaim(ClaimBilingualLanguagePreference.WELSH)));
    mockGetFeePaymentStatus.mockResolvedValueOnce(successPaymentStatus);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=cy`);
  });

  it('should return to Payment Unsuccessful page when payment has failed and not delete the draft', async () => {
    const req = createReq(sessionDraftId);
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(createClaim()));
    mockGetFeePaymentStatus.mockResolvedValueOnce({
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference,
      errorDescription: 'Payment Failed',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
    expect(req.session.draftId).toBe(sessionDraftId);
    expect(actualPaymentRedirectUrl).toBe(PAY_CLAIM_FEE_UNSUCCESSFUL_URL);
  });

  it('should return to dashboard when payment is cancelled by user and not delete the draft', async () => {
    const req = createReq(sessionDraftId);
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(createClaim()));
    mockGetFeePaymentStatus.mockResolvedValueOnce({
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference,
      errorDescription: 'Payment was cancelled by the user',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
    expect(req.session.draftId).toBe(sessionDraftId);
    expect(actualPaymentRedirectUrl).toBe(DASHBOARD_URL);
  });

  it('should throw when no draft claim is found', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(getRedirectUrl(claimId, createReq(sessionDraftId))).rejects.toThrow(
      '[claimFeePaymentConfirmationService] no draft claim found',
    );
    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
  });

  it('should return 500 error page for any service error', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(createClaim()));
    mockGetFeePaymentStatus.mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    await expect(getRedirectUrl(claimId, createReq(sessionDraftId))).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
  });
});
