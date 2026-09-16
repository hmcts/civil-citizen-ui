import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {FeeType} from 'form/models/helpWithFees/feeType';

jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('services/features/feePayment/feePaymentService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGetFeePaymentRedirectInformation = getFeePaymentRedirectInformation as jest.Mock;

const claimId = '12345';
const draftId = 'test-draft-id';

const createReq = (): AppRequest => ({
  params: {id: claimId},
  session: {
    draftId,
    user: {id: 'user-id'},
  },
} as unknown as AppRequest);

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
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

describe('ClaimFeeMakePaymentAgain Service', () => {
  const mockClaimFeePaymentRedirectInfo = {
    status: 'initiated',
    nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    paymentReference: 'RC-1701-0909-0602-0418',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateDraftClaim.mockResolvedValue(undefined);
  });

  it('should update with payment reference on generation of payment link', async () => {
    const mockClaim = new Claim();
    mockClaim.claimDetails = new ClaimDetails();
    mockClaim.claimDetails.claimFeePayment = new PaymentInformation('1234', 'RC-1701-0909-0602-0417');
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, createReq());

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockGetFeePaymentRedirectInformation).toHaveBeenCalledWith(claimId, FeeType.CLAIMISSUED, expect.anything());
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        claimDetails: expect.objectContaining({
          claimFeePayment: mockClaimFeePaymentRedirectInfo,
        }),
      }),
      draftId,
    );
  });

  it('should throw when no draft claim is found', async () => {
    mockGetFeePaymentRedirectInformation.mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(getRedirectUrl(claimId, createReq())).rejects.toThrow(
      '[claimFeeMakePaymentAgainService] no draft claim found',
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
