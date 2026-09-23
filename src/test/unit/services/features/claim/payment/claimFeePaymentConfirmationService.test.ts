import {getRedirectUrl} from 'services/features/claim/payment/claimFeePaymentConfirmationService';
import {getClaimById} from 'modules/utilityService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {isWelshEnabledForMainCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PAY_CLAIM_FEE_SUCCESSFUL_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL, DASHBOARD_URL} from 'routes/urls';

jest.mock('modules/utilityService');
jest.mock('services/features/feePayment/feePaymentService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
  generateRedisKey: jest.fn((req) => `${req.params.id}${req.session.user.id}`),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockGetFeePaymentStatus = getFeePaymentStatus as jest.Mock;
const mockIsWelshEnabledForMainCase = isWelshEnabledForMainCase as jest.Mock;
const mockDeleteDraftClaimFromStore = deleteDraftClaimFromStore as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;

const claimId = '1';
const paymentReference = 'RC-1701-0909-0602-0418';

const createReq = (): AppRequest => ({
  params: {id: '123'},
  session: {
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

const successPaymentStatus = {
  status: 'Success',
  nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
  externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
  paymentReference,
};

describe('Claim Fee PaymentConfirmation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsWelshEnabledForMainCase.mockResolvedValue(true);
  });

  it('should return to payment successful screen if payment is successful', async () => {
    const req = createReq();
    mockGetClaimById.mockResolvedValue(createClaim());
    mockGetFeePaymentStatus.mockResolvedValueOnce(successPaymentStatus);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(mockGetClaimById).toHaveBeenCalledWith(claimId, req, true);
    expect(mockGetFeePaymentStatus).toHaveBeenCalledWith(claimId, paymentReference, FeeType.CLAIMISSUED, req);
    expect(mockGenerateRedisKey).toHaveBeenCalledWith(req);
    expect(mockDeleteDraftClaimFromStore).toHaveBeenCalledWith('123user-id');
    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=en`);
  });

  it('should redirect with lang=cy when claimant language preference is Welsh', async () => {
    mockGetClaimById.mockResolvedValue(createClaim(ClaimBilingualLanguagePreference.WELSH));
    mockGetFeePaymentStatus.mockResolvedValueOnce(successPaymentStatus);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(mockDeleteDraftClaimFromStore).toHaveBeenCalledWith('123user-id');
    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=cy`);
  });

  it('should return to Payment Unsuccessful page when payment has failed', async () => {
    mockGetClaimById.mockResolvedValue(createClaim());
    mockGetFeePaymentStatus.mockResolvedValueOnce({
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference,
      errorDescription: 'Payment Failed',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(mockDeleteDraftClaimFromStore).not.toHaveBeenCalled();
    expect(actualPaymentRedirectUrl).toBe(PAY_CLAIM_FEE_UNSUCCESSFUL_URL);
  });

  it('should return to dashboard when payment is cancelled by user', async () => {
    mockGetClaimById.mockResolvedValue(createClaim());
    mockGetFeePaymentStatus.mockResolvedValueOnce({
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference,
      errorDescription: 'Payment was cancelled by the user',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(mockDeleteDraftClaimFromStore).not.toHaveBeenCalled();
    expect(actualPaymentRedirectUrl).toBe(DASHBOARD_URL);
  });

  it('should return 500 error page for any service error', async () => {
    mockGetClaimById.mockResolvedValue(createClaim());
    mockGetFeePaymentStatus.mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    await expect(getRedirectUrl(claimId, createReq())).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
    expect(mockDeleteDraftClaimFromStore).not.toHaveBeenCalled();
  });

  it('should return to Payment Unsuccessful page when payment reference is missing', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {};
    mockGetClaimById.mockResolvedValue(claim);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(actualPaymentRedirectUrl).toBe(PAY_CLAIM_FEE_UNSUCCESSFUL_URL);
    expect(mockGetFeePaymentStatus).not.toHaveBeenCalled();
    expect(mockDeleteDraftClaimFromStore).not.toHaveBeenCalled();
  });

});
