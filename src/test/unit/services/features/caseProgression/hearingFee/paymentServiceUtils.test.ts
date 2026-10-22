import {HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getRedirectUrlCommon} from 'services/features/caseProgression/hearingFee/paymentServiceUtils';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {getClaimById} from 'modules/utilityService';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(), getCaseDataFromStore: jest.fn(), saveDraftClaim: jest.fn(),
}));
jest.mock('services/features/caseProgression/caseProgressionService', () => ({saveCaseProgression: jest.fn()}));
jest.mock('services/features/feePayment/feePaymentService', () => ({
  getFeePaymentRedirectInformation: jest.fn(), getFeePaymentStatus: jest.fn(),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({saveUserId: jest.fn()}));
jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));

const stored = jest.mocked(getCaseDataFromStore);
const redirect = jest.mocked(getFeePaymentRedirectInformation);
const status = jest.mocked(getFeePaymentStatus);
const save = jest.mocked(saveCaseProgression);
const saveOwner = jest.mocked(saveUserId);
const latest = jest.mocked(getClaimById);
const saveDraft = jest.mocked(saveDraftClaim);
const claimWith = (paymentReference?: string): Claim => ({
  caseProgression: {hearing: {paymentInformation: {paymentReference, nextUrl: '/pending-payment'}}},
} as Claim);

describe('hearing fee payment references', () => {
  let req: AppRequest;
  beforeEach(() => {
    jest.resetAllMocks();
    req = {params: {id: '123'}, session: {user: {id: 'owner'}}} as unknown as AppRequest;
    jest.mocked(generateRedisKey).mockReturnValue('123owner');
    save.mockResolvedValue(undefined);
    saveOwner.mockResolvedValue(undefined);
  });

  it.each([undefined, null, '', ' ', 'undefined', 'null'])(
    'never requests payment status with unusable stored reference %p', async reference => {
      stored.mockResolvedValue(claimWith(reference));
      redirect.mockResolvedValue(null);
      expect(await getRedirectUrlCommon('123', req)).toBe(constructResponseUrlWithIdParams('123', HEARING_FEE_APPLY_HELP_FEE_SELECTION));
      expect(redirect).toHaveBeenCalledWith('123', FeeType.HEARING, req);
      expect(status).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      expect(saveOwner).not.toHaveBeenCalled();
    },
  );

  it('checks and saves a valid stored reference under the same claim, fee type and owner', async () => {
    const claim = claimWith('RC-HEARING');
    stored.mockResolvedValue(claim);
    status.mockResolvedValue({status: 'Success'} as PaymentInformation);
    expect(await getRedirectUrlCommon('123', req)).toBe(constructResponseUrlWithIdParams('123', HEARING_FEE_PAYMENT_CONFIRMATION_URL));
    expect(redirect).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith('123', 'RC-HEARING', FeeType.HEARING, req);
    expect(save).toHaveBeenCalledWith(req, claim.caseProgression.hearing.paymentInformation, 'paymentInformation', 'hearing');
    expect(saveOwner).toHaveBeenCalledWith('123', FeeType.HEARING, 'owner');
  });

  it('does not query status when newly initiated payment has no usable reference', async () => {
    stored.mockResolvedValue(claimWith());
    redirect.mockResolvedValue({nextUrl: '/new-payment', paymentReference: 'undefined'} as PaymentInformation);
    expect(await getRedirectUrlCommon('123', req)).toBe('/new-payment');
    expect(status).not.toHaveBeenCalled();
  });

  it('requests a replacement after failure and saves that complete payment information', async () => {
    stored.mockResolvedValue(claimWith('RC-OLD'));
    status.mockResolvedValue({status: 'Failed'} as PaymentInformation);
    const replacement = {paymentReference: 'RC-NEW', nextUrl: '/new-payment'} as PaymentInformation;
    redirect.mockResolvedValue(replacement);
    expect(await getRedirectUrlCommon('123', req)).toBe('/new-payment');
    expect(save).toHaveBeenLastCalledWith(req, replacement, 'paymentInformation', 'hearing');
    expect(status).toHaveBeenCalledTimes(1);
  });

  it('keeps the pending next URL without starting another payment', async () => {
    stored.mockResolvedValue(claimWith('RC-PENDING'));
    status.mockResolvedValue({status: 'Initiated'} as PaymentInformation);
    expect(await getRedirectUrlCommon('123', req)).toBe('/pending-payment');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('marks synchronization failure on the current claim and preserves the owner on persistence', async () => {
    stored.mockResolvedValue(claimWith());
    const claim = claimWith();
    claim.id = '123';
    claim.totalClaimAmount = 1300;
    claim.paymentSyncError = false;
    const expected = structuredClone(claim);
    expected.paymentSyncError = true;
    const writes: Parameters<typeof saveDraftClaim>[] = [];
    saveDraft.mockImplementation(async (key, draft, doNotThrowError, owner) => {
      writes.push([key, structuredClone(draft), doNotThrowError, owner]);
    });
    latest.mockResolvedValue(claim);
    redirect.mockRejectedValue(new Error('payment unavailable'));
    expect(await getRedirectUrlCommon('123', req)).toBe(constructResponseUrlWithIdParams('123', HEARING_FEE_APPLY_HELP_FEE_SELECTION));
    expect(latest).toHaveBeenCalledWith('123', req, true);
    expect(writes).toEqual([['123owner', expected, true, 'owner']]);
    expect(saveDraft).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });

  it('propagates status errors without starting a replacement payment', async () => {
    stored.mockResolvedValue(claimWith('RC-VALID'));
    const failure = new Error('status unavailable');
    status.mockRejectedValue(failure);
    await expect(getRedirectUrlCommon('123', req)).rejects.toBe(failure);
    expect(redirect).not.toHaveBeenCalled();
  });
});
