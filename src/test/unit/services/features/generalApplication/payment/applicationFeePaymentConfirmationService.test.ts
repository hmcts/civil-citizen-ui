import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION, GA_PAYMENT_SUCCESSFUL_COSC_URL,
  GA_PAYMENT_SUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_COSC_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {getRedirectUrl} from 'services/features/generalApplication/payment/applicationFeePaymentConfirmationService';
import {GaServiceClient} from 'client/gaServiceClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';

jest.mock('modules/draft-store');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(), getGaFeePaymentRedirectInformation: jest.fn(),
}));

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.query = {lang:'en'};
const claimId = '1';
const applicationId = '12';
let applicationResponse: ApplicationResponse;
const lang = '?lang=en';

describe('Application Fee PaymentConfirmation Service', () => {
  beforeEach(() => {
    applicationResponse = {
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
        generalAppPBADetails: {
          fee: undefined,
          paymentDetails: undefined,
          serviceRequestReference: undefined,
        },
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '',
      last_modified: '',
      state: undefined,
    };
  });
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');

  it('should return to payment successful screen if payment is successful', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };

    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };

    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_SUCCESSFUL_URL+lang);
  });

  it('should return to additional payment successful screen if payment is successful', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };

    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);

    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_SUCCESSFUL_URL+lang);
  });

  it('should return to Payment Unsuccessful page when payment has failed', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment Failed',
    };
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_UNSUCCESSFUL_URL+lang);
  });

  it('should return to help with fees page when payment is canceled by user', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user',
    };
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_APPLY_HELP_WITH_FEE_SELECTION+lang);
  });

  it('should return to additional payment help with fees page when payment is canceled by user', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment was cancelled by the user',
    };
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL+lang);
  });

  it('should return 500 error page for any service error', async () => {
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
    };
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);

    //Then
    await expect(getRedirectUrl(claimId, applicationId, mockedAppRequest)).rejects.toBe(
      TestMessages.SOMETHING_WENT_WRONG,
    );
  });
  it('should return to payment successful screen if payment is successful for COSC application.', async () => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');

    const mockclaimFeePaymentInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };

    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    applicationResponse.case_data.applicationTypes = 'Confirm you\'ve paid a judgment debt';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_SUCCESSFUL_COSC_URL+'?lang=en');
  });
  it('should return to Payment Unsuccessful page when payment has failed for COSC application', async () => {
    const mockclaimFeePaymentInfo = {
      status: 'Failed',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
      errorDescription: 'Payment Failed',
    };
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      paymentReference:'RC-1701-0909-0602-0418',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
    };
    applicationResponse.case_data.applicationTypes = 'Confirm you\'ve paid a judgment debt';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentStatus').mockResolvedValueOnce(mockclaimFeePaymentInfo);
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    //when
    const actualPaymentRedirectUrl = await getRedirectUrl(claimId, applicationId, mockedAppRequest);

    //Then
    expect(actualPaymentRedirectUrl).toBe(GA_PAYMENT_UNSUCCESSFUL_COSC_URL+lang);
  });
});
