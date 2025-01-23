import * as requestModels from 'models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {
  APPLICATION_FEE_PAYMENT_CONFIRMATION_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES,
} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {AppSession, UserDetails} from 'models/AppRequest';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import * as feePaymentServiceModule from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {PaymentInformation} from 'models/feePayment/paymentInformation';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store/paymentSessionStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
}));

jest.mock('services/features/generalApplication/applicationFee/generalApplicationFeePaymentService', () => ({
  getGaFeePaymentStatus: jest.fn(),
  getGaFeePaymentRedirectInformation: jest.fn(),
}));

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id:'1'};
const claimId = '1';
const nextUrl= 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960';
let claim: Claim;
let ccdClaim: Claim;
let ccdClaimNoGARef: Claim;
let applicationResponse: ApplicationResponse;
const mockGAHwFDraftStore = getDraftGAHWFDetails as jest.Mock;
describe('apply help with application fee selection', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    ccdClaim = new Claim();
    ccdClaim.generalApplications = [
      {
        'id': 'test',
        'value': {
          'caseLink': {
            'CaseReference': 'testApp1',
          },
        },
      },
    ];
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
    ccdClaimNoGARef = new Claim();
    ccdClaimNoGARef.generalApplications = [
      {
        'id': 'test',
        'value': {
          'caseLink': undefined,
        },
      },
    ];
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
    mockedAppRequest.session = <AppSession>{user: <UserDetails>{id: '1235'}};
    mockGAHwFDraftStore.mockResolvedValue(new GaHelpWithFees());
  });
  it('should return test url if applyHelpWithFees option is No without exists reference', async () => {
    //given
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, nextUrl));
  });

  it('should return test url if applyHelpWithFees option is No with exists reference', async () => {
    //given
    const newClaim = claim;
    newClaim.generalApplication.applicationFeePaymentDetails = new PaymentInformation('test','test', 'test', nextUrl);
    (getClaimById as jest.Mock).mockResolvedValue(newClaim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, nextUrl));
  });

  it('should return - Do you want to continue to apply for Help with Fees page if applyHelpWithFees option is yes', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
    mockedAppRequest.params = {appId: '12345667'};
    mockedAppRequest.query = {appFee: '1400'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, '12345667', GA_APPLY_HELP_WITH_FEES) + '?additionalFeeTypeFlag=false');
  });

  it('should return correct url - if applyHelpWithFees option is yes and paying for additional fee', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
    mockedAppRequest.params = {appId: '12345667'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, '12345667', GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag=true'));
  });

  it('should enable the warning text if payment request is failed', async () => {
    claim.paymentSyncError = false;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    mockedAppRequest.params = {appId: '123456678'};
    applicationResponse = new ApplicationResponse();
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockRejectedValueOnce(new Error('something went wrong'));
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, '123456678', GA_APPLY_HELP_WITH_FEE_SELECTION));
  });

  it('should enable the warning text if claim not updated with GA ref', async () => {
    const originalUrl = '/case/1/general-application/apply-help-fee-selection?id=abcdef&appFee=275';
    claim.paymentSyncError = false;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaimNoGARef);
    mockedAppRequest.query = {id: 'abcdef'};
    mockedAppRequest.params = {appId: '123456678'};
    mockedAppRequest.originalUrl = originalUrl;
    applicationResponse = new ApplicationResponse();
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(originalUrl);
  });

  it('should redirect to confirmation url if already paid', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentStatus').mockResolvedValue({status: 'Success'});
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, 'testApp1', APPLICATION_FEE_PAYMENT_CONFIRMATION_URL));
  });

  it('should get new payment ref if previous payment failed', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentStatus').mockResolvedValue({status: 'Failed'});
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, nextUrl));
  });

  it('should get new payment ref if previous payment failed - no payment data returned', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    mockedAppRequest.originalUrl = constructResponseUrlWithIdAndAppIdParams(claimId, '123', GA_APPLY_HELP_WITH_FEE_SELECTION);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentStatus').mockResolvedValue({status: 'Failed'});
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(undefined);
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, '123', GA_APPLY_HELP_WITH_FEE_SELECTION));
  });

  it('should redirect to payment if cannot get payment status', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    mockedAppRequest.originalUrl = constructResponseUrlWithIdAndAppIdParams(claimId, '123', GA_APPLY_HELP_WITH_FEE_SELECTION);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValue(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentRedirectInformation').mockResolvedValue(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    jest.spyOn(feePaymentServiceModule, 'getGaFeePaymentStatus').mockRejectedValueOnce(new Error('something went wrong'));
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, nextUrl));
  });
});
