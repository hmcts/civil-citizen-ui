import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL,
} from 'routes/urls';
import { getRedirectUrl } from 'services/features/generalApplication/payment/applicationFeePaymentConfirmationService';
import { GaServiceClient } from 'client/gaServiceClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/courtLocationCache');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
}));

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';
const applicationId = '12';
const applicationResponse: ApplicationResponse = {
  case_data: {
    applicationTypes: undefined,
    generalAppType: undefined,
    generalAppRespondentAgreement: undefined,
    generalAppInformOtherParty: undefined,
    generalAppAskForCosts: undefined,
    generalAppDetailsOfOrder: undefined,
    generalAppReasonsOfOrder: undefined,
    generalAppEvidenceDocument: undefined,
    gaAddlDoc: undefined,
    generalAppHearingDetails: undefined,
    generalAppStatementOfTruth: undefined,
    generalAppPBADetails: undefined,
    applicationFeeAmountInPence: undefined,
    parentClaimantIsApplicant: undefined,
  },
  created_date: '',
  id: '',
  last_modified: '',
  state: undefined,
};

describe('Application Fee PaymentConfirmation Service', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');

  it('should return to payment successful screen if payment is successful', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };

    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_SUCCESSFUL_URL);
  });

  it('should return to additional payment successful screen if payment is successful', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };

    applicationResponse.case_data.applicationFeeAmountInPence = '12300';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_SUCCESSFUL_URL);
  });

  it('should return to Payment Unsuccessful page when payment has failed', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment Failed',
    };
    applicationResponse.case_data.applicationFeeAmountInPence = undefined;
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_UNSUCCESSFUL_URL);
  });

  it('should return to help with fees page when payment is canceled by user', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user',
    };
    applicationResponse.case_data.applicationFeeAmountInPence = undefined;
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_APPLY_HELP_WITH_FEE_SELECTION);
  });

  it('should return to additional payment help with fees page when payment is canceled by user', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user',
    };
    applicationResponse.case_data.applicationFeeAmountInPence = '12300';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL);
  });

  it('should return 500 error page for any service error', async () => {
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, applicationId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });

});
