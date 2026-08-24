import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeePaymentConfirmationService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PAY_CLAIM_FEE_SUCCESSFUL_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL, DASHBOARD_URL} from 'routes/urls';
import {getDraftClaim, deleteDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isWelshEnabledForMainCase: jest.fn().mockResolvedValue(false),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockDeleteDraftClaim = deleteDraftClaim as jest.Mock;
const claimId = '1';

const mockedAppRequest = {
  params: {id: '123'},
  session: {user: {id: '123'}, draftId: 'draft-123'},
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

const claimWithPayment = (): Claim => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1701-0909-0602-0418'};
  return claim;
};

describe('Claim Fee PaymentConfirmation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claimWithPayment()));
    mockDeleteDraftClaim.mockResolvedValue(undefined);
  });

  it('should return to payment successful screen if payment is successful', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce({
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=en`);
    expect(mockDeleteDraftClaim).toHaveBeenCalledWith(mockedAppRequest, 'draft-123');
  });

  it('should return to Payment Unsuccessful page when payment has failed', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce({
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment Failed',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    expect(actualPaymentRedirectUrl).toBe(PAY_CLAIM_FEE_UNSUCCESSFUL_URL);
    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
  });

  it('should return to dashboard when payment is cancelled by user', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce({
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user',
    });

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    expect(actualPaymentRedirectUrl).toBe(DASHBOARD_URL);
    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
  });

  it('should throw when no draft exists', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toThrow(
      '[claimFeePaymentConfirmationService] no draft claim found',
    );
    expect(mockDeleteDraftClaim).not.toHaveBeenCalled();
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });
});
