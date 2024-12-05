import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  APPLY_HELP_WITH_FEES, HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  HEARING_FEE_PAYMENT_CONFIRMATION_URL,
} from 'routes/urls';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getClaimById} from 'modules/utilityService';

jest.mock('services/features/feePayment/feePaymentService');
jest.mock('services/features/caseProgression/caseProgressionService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/paymentSessionStoreService');
jest.mock('common/utils/urlFormatter');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('getRedirectUrl', () => {
  const claimId = '1';
  const mockAppRequest = {
    session: {user: {id: 'userId'}},
    params: {id: claimId},
  } as unknown as AppRequest;

  it('returns gov pay url if user selects No and payment status is Initiated', async () => {
    const mockPaymentInfo = {nextUrl: 'https://payment.url', paymentReference: 'paymentRef'} as PaymentInformation;
    const mockPaymentStatus = {status: 'Initiated'};
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(mockPaymentInfo);
    (getFeePaymentStatus as jest.Mock).mockResolvedValue(mockPaymentStatus);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());

    const result = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest);

    expect(result).toBe(mockPaymentInfo.nextUrl);
  });

  it('returns Apply help with fees start url if user selects Yes', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
    const result = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), mockAppRequest);

    expect(result).toBe(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES));
  });

  it('returns hearing fee confirmation url if payment status is Success', async () => {
    const mockPaymentInfo = {nextUrl: 'https://payment.url', paymentReference: 'paymentRef'} as PaymentInformation;
    const mockPaymentStatus = {status: 'Success'};
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(mockPaymentInfo);
    (getFeePaymentStatus as jest.Mock).mockResolvedValue(mockPaymentStatus);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());

    const result = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest);

    expect(result).toBe(constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CONFIRMATION_URL));
  });

  it('returns new payment url if previous payment failed', async () => {
    const mockPaymentInfo = {nextUrl: 'https://payment.url', paymentReference: 'paymentRef'} as PaymentInformation;
    const mockFailedPaymentStatus = {status: 'Failed'};
    const mockNewPaymentInfo = {nextUrl: 'https://new.payment.url', paymentReference: 'newPaymentRef'} as PaymentInformation;
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getFeePaymentRedirectInformation as jest.Mock).mockResolvedValueOnce(mockPaymentInfo).mockResolvedValueOnce(mockNewPaymentInfo);
    (getFeePaymentStatus as jest.Mock).mockResolvedValue(mockFailedPaymentStatus);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());

    const result = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest);

    expect(result).toBe(mockNewPaymentInfo.nextUrl);
  });

  it('throws error if getFeePaymentStatus fails', async () => {
    const mockPaymentInfo = {nextUrl: 'https://payment.url', paymentReference: 'paymentRef'} as PaymentInformation;
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(mockPaymentInfo);
    (getFeePaymentStatus as jest.Mock).mockRejectedValue(new Error('Failed to get payment status'));

    await expect(getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest)).rejects.toThrow('Failed to get payment status');
  });

  it('throws error if getCaseDataFromStore fails', async () => {
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(new Error('Failed to get case data'));

    await expect(getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest)).rejects.toThrow('Failed to get case data');
  });

  it('throws error if getClaimById fails', async () => {
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getClaimById as jest.Mock).mockRejectedValue(new Error('Failed to get claim by id'));

    await expect(getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), mockAppRequest)).rejects.toThrow('Failed to get claim by id');
  });

  it('returns payment nextUrl if paymentRedirectInformation is defined', async () => {
    const mockPaymentInfo = {nextUrl: 'https://payment.url', paymentReference: 'paymentRef'} as PaymentInformation;
    const mockFailedPaymentStatus = {status: 'Initiated'};
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(mockPaymentInfo);
    (getFeePaymentStatus as jest.Mock).mockResolvedValue(mockFailedPaymentStatus);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());

    const result = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest);

    expect(result).toBe(mockPaymentInfo.nextUrl);
  });

  it('returns HEARING_FEE_APPLY_HELP_FEE_SELECTION url if paymentRedirectInformation is undefined', async () => {
    (generateRedisKey as jest.Mock).mockReturnValue('redisKey');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
    (getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(undefined);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());

    const result = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), mockAppRequest);

    expect(result).toBe(constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
  });
});
