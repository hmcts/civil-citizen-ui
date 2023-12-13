import {CivilServiceClient} from 'client/civilServiceClient';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/paymentConfirmationService';
import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
  PAY_HEARING_FEE_SUCCESSFUL_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
} from 'routes/urls';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/courtLocationCache');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';

describe('PaymentConfirmation Service', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  it('should return to payment successful screen if payment is successful', async () => {
    const mockHearingFeePaymentInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(mockHearingFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(PAY_HEARING_FEE_SUCCESSFUL_URL);
  });

  it('should return to Payment Unsuccessful page ii payment has failed', async () => {
    const mockHearingFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment Failed',
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(mockHearingFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(PAY_HEARING_FEE_UNSUCCESSFUL_URL);
  });

  it('should return to Apply help fee selection page if payment has failed', async () => {
    const mockHearingFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user'
    };
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockResolvedValueOnce(mockHearingFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(HEARING_FEE_APPLY_HELP_FEE_SELECTION);
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });

});
