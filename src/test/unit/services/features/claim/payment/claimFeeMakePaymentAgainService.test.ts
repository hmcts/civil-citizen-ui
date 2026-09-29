import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {getClaimIssuePaymentClaim} from 'routes/features/claim/payment/claimIssuePaymentDraftService';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {FeeType} from 'form/models/helpWithFees/feeType';

jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');
jest.mock('routes/features/claim/payment/claimIssuePaymentDraftService');
jest.mock('services/features/feePayment/feePaymentService');

const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetClaimById = getClaimById as jest.Mock;
const mockIsDraftClaimDatabaseEnabled = isDraftClaimDatabaseEnabled as jest.Mock;
const mockGetClaimIssuePaymentClaim = getClaimIssuePaymentClaim as jest.Mock;
const mockGetFeePaymentRedirectInformation = getFeePaymentRedirectInformation as jest.Mock;

const claimId = '12345';
const draftId = 'draft-123';

const createReq = (): AppRequest => ({
  params: {id: claimId},
  session: {
    user: {id: 'user-id'},
  },
} as unknown as AppRequest);

describe('ClaimFeeMakePaymentAgain Service', () => {
  const mockClaimFeePaymentRedirectInfo = {
    status: 'initiated',
    nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    paymentReference: 'RC-1701-0909-0602-0418',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDraftClaimDatabaseEnabled.mockResolvedValue(true);
    mockGenerateRedisKey.mockReturnValue(`${claimId}user-id`);
    mockUpdateDraftClaim.mockResolvedValue(undefined);
  });

  it('should update with payment reference on generation of payment link', async () => {
    const mockClaim = new Claim();
    mockClaim.claimDetails = new ClaimDetails();
    mockClaim.claimDetails.claimFeePayment = new PaymentInformation('1234', 'RC-1701-0909-0602-0417');
    mockGetClaimIssuePaymentClaim.mockResolvedValue({claim: mockClaim, draftId});
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const req = createReq();
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, expect.anything());
    expect(mockGetClaimIssuePaymentClaim).toHaveBeenCalledWith(req);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        claimDetails: expect.objectContaining({
          claimFeePayment: mockClaimFeePaymentRedirectInfo,
        }),
      }),
      draftId,
    );
  });

  it('should still pay when the issued claim has no claimDetails yet', async () => {
    mockGetClaimIssuePaymentClaim.mockResolvedValue({claim: new Claim(), draftId});
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockUpdateDraftClaim).toHaveBeenCalled();
  });

  it('should save payment information to Redis when the draft database flag is off', async () => {
    const mockClaim = new Claim();
    mockClaim.claimDetails = new ClaimDetails();
    mockIsDraftClaimDatabaseEnabled.mockResolvedValue(false);
    mockGetClaimById.mockResolvedValue(mockClaim);
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const req = createReq();
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, req);

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockGetClaimById).toHaveBeenCalledWith(claimId, req, true);
    expect(mockGetClaimIssuePaymentClaim).not.toHaveBeenCalled();
    expect(mockSaveDraftClaim).toHaveBeenCalledWith(
      `${claimId}user-id`,
      mockClaim,
      true,
      'user-id',
      TTLCategory.DRAFT_CLAIM,
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should return 500 error page for any service error', async () => {
    mockGetFeePaymentRedirectInformation.mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    await expect(getRedirectUrl(claimId, createReq())).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });
});
