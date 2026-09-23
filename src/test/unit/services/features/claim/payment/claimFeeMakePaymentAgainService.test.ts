import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {getClaimById} from 'modules/utilityService';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {FeeType} from 'form/models/helpWithFees/feeType';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/feePayment/feePaymentService');

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const mockGetClaimById = getClaimById as jest.Mock;
const mockGetFeePaymentRedirectInformation = getFeePaymentRedirectInformation as jest.Mock;

const claimId = '12345';
const redisKey = '12345user-id';

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
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  it('should update with payment reference on generation of payment link', async () => {
    const mockClaim = new Claim();
    mockClaim.claimDetails = new ClaimDetails();
    mockClaim.claimDetails.claimFeePayment = new PaymentInformation('1234', 'RC-1701-0909-0602-0417');
    mockGetClaimById.mockResolvedValue(mockClaim);
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, expect.anything());
    expect(mockSaveDraftClaim).toHaveBeenCalledWith(
      redisKey,
      expect.objectContaining({
        claimDetails: expect.objectContaining({
          claimFeePayment: mockClaimFeePaymentRedirectInfo,
        }),
      }),
      true,
      'user-id',
      TTLCategory.JOURNEY_CACHE,
    );
  });

  it('should still pay when the issued claim has no claimDetails yet', async () => {
    mockGetClaimById.mockResolvedValue(new Claim());
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockSaveDraftClaim).toHaveBeenCalled();
  });

  it('should return 500 error page for any service error', async () => {
    mockGetFeePaymentRedirectInformation.mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    await expect(getRedirectUrl(claimId, createReq())).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
    expect(mockSaveDraftClaim).not.toHaveBeenCalled();
  });
});
