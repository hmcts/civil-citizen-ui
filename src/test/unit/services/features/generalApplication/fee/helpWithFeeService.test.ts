import * as requestModels from 'models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GaServiceClient} from 'client/gaServiceClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {AppSession, UserDetails} from 'models/AppRequest';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
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

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const claimId = '1';
const nextUrl= 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960';
let claim: Claim;
let ccdClaim: Claim;
let applicationResponse: ApplicationResponse;
const mockGAHwFDraftStore = getDraftGAHWFDetails as jest.Mock;
describe('apply help with application fee selection', () => {
  beforeEach(() => {
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
    mockedAppRequest.session = <AppSession>{user: <UserDetails>{id: '1235'}}
    mockGAHwFDraftStore.mockResolvedValueOnce(new GaHelpWithFees());
  });
  it('should return test url if applyHelpWithFees option is No', async () => {
    //given
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(ccdClaim);
    const mockClaimFeePaymentRedirectInfo = {
      status: 'initiated',
      nextUrl: nextUrl,
    };
    jest.spyOn(GaServiceClient.prototype, 'getGaFeePaymentRedirectInformation').mockResolvedValueOnce(mockClaimFeePaymentRedirectInfo);
    mockedAppRequest.query = {id: 'test'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdParams(claimId, nextUrl));
  });

  it('should return - Do you want to continue to apply for Help with Fees page if applyHelpWithFees option is yes', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(ccdClaim);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
    mockedAppRequest.params = {appId: '12345667'};
    mockedAppRequest.query = {appFee: '1400'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, '12345667', GA_APPLY_HELP_WITH_FEES));
  });

  it('should return correct url - if applyHelpWithFees option is yes and paying for additional fee', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(ccdClaim);
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
    mockedAppRequest.params = {appId: '12345667'};
    //when
    const actualRedirectUrl = await getRedirectUrl(claimId, new GenericYesNo(YesNo.YES), 'applyHelpWithFees', mockedAppRequest);
    //Then
    expect(actualRedirectUrl).toBe(constructResponseUrlWithIdAndAppIdParams(claimId, '12345667', GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag=true'));
  });
});
