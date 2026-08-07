import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeePaymentConfirmationService';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PAY_CLAIM_FEE_SUCCESSFUL_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL, DASHBOARD_URL} from 'routes/urls';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';

jest.mock('modules/draft-store');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';
const paymentSuccessfulResponse = {
  status: 'Success',
  nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
  externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
  paymentReference: 'RC-1701-0909-0602-0418',
};

const mockDraftClaimWithLanguage = (claimantBilingualLanguagePreference: ClaimBilingualLanguagePreference) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({case_data: {claimantBilingualLanguagePreference}}))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve(-1)),
  expireat: jest.fn(() => Promise.resolve({})),
});

describe('Claim Fee PaymentConfirmation Service', () => {
  mockedAppRequest.params = {id: '123'};
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');

  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
  });

  it('should return to payment successful screen if payment is successful', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(paymentSuccessfulResponse);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=en`);
  });

  it('should return to payment successful screen in Welsh when claimant selected Welsh only', async () => {
    app.locals.draftStoreClient = mockDraftClaimWithLanguage(ClaimBilingualLanguagePreference.WELSH);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(paymentSuccessfulResponse);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=cy`);
  });

  it('should return to payment successful screen in English when claimant selected Welsh and English', async () => {
    app.locals.draftStoreClient = mockDraftClaimWithLanguage(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(paymentSuccessfulResponse);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(`${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=en`);
  });

  it('should return to Payment Unsuccessful page when payment has failed', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment Failed',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(PAY_CLAIM_FEE_UNSUCCESSFUL_URL);
  });

  it('should return to Payment confirmation page when payment is canceled by user', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(DASHBOARD_URL);
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });

});
