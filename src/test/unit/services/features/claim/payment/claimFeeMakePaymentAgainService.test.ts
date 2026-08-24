import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const claimId = '12345';

const mockedAppRequest = {
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

describe('ClaimFeeMakePaymentAgain Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update with payment reference on generation of payment link', async () => {
    const mockClaim = new Claim();
    mockClaim.claimDetails = new ClaimDetails();
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
    mockUpdateDraftClaim.mockResolvedValue({});

    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    expect(actualPaymentRedirectUrl).toBe(mockClaimFeePaymentRedirectInfo.nextUrl);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockedAppRequest,
      expect.objectContaining({
        claimDetails: expect.objectContaining({
          claimFeePayment: mockClaimFeePaymentRedirectInfo,
        }),
      }),
      'draft-123',
    );
  });

  it('should throw when no draft exists', async () => {
    mockGetDraftClaim.mockResolvedValue(null);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({
      nextUrl: 'https://example.com',
    });

    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toThrow(
      '[claimFeeMakePaymentAgainService] no draft claim found to update',
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });
});
