import { CivilServiceClient } from 'client/civilServiceClient';
import { YesNo } from 'common/form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { CaseProgressionHearing } from 'common/models/caseProgression/caseProgressionHearing';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import { saveDraftClaim } from 'modules/draft-store/draftStoreService';
import {
  gaApplicationFeeDetails,
  getGaAppFeeDetails,
  getGaAppId, updateHearingDateForGAApplicationFee,
} from 'services/features/generalApplication/feeDetailsService';
import {CcdFee} from 'models/ccdGeneralApplication/ccdGeneralApplicationPBADetails';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {CaseState} from 'form/models/claimDetails';
import {ClaimFeeData} from 'models/civilClaimResponse';

jest.mock('../../../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn().mockReturnValueOnce('123'),
  saveDraftClaim: jest.fn(),
}));

const ccdClaim = new Claim();
ccdClaim.generalApplications = [
  {
    'id': 'test',
    'value': {
      'caseLink': {
        'CaseReference': 'gaApp1',
      },
    },
  },
];
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
    generalAppPBADetails: {
      fee: {
        code: 'Fe124',
        version: '0',
        calculatedAmountInPence: '1400',
      },
      paymentDetails: {
        status: 'SUCCESS',
        reference: undefined,
      },
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

describe('GA fee details', () => {
  let claim: Claim;
  beforeEach(() => {
    jest.clearAllMocks();
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();

  });

  it('should fetch the fee details and save data', async () => {
    const gaFeeDetails = {
      calculatedAmountInPence: 1400,
      code: 'Fe124',
      version: 0,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);

    claim.generalApplication.applicationTypes = [{ option: ApplicationTypeOption.SET_ASIDE_JUDGEMENT, isOtherSelected: () => false }];
    const gaFeeData = await gaApplicationFeeDetails(claim, {} as AppRequest);
    expect(gaFeeDetails).toEqual(gaFeeData);
    expect(gaFeeDetails).toEqual(claim.generalApplication.applicationFee);
    expect(saveDraftClaim).toHaveBeenCalledWith('123', claim);
  });
  it('should fetch the fee details with consent and  agreement and hearing save data', async () => {
    const gaFeeDetails = {
      calculatedAmountInPence: 0,
      code: 'Free',
      version: 0,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);

    const gaFeeData = await gaApplicationFeeDetails(claim, {} as AppRequest);
    expect(gaFeeDetails).toEqual(gaFeeData);
    expect(gaFeeDetails).toEqual(claim.generalApplication.applicationFee);
  });

  it('should update the hearing date for adjourn hearing with consent', async () => {
    const gaFeeDetails = {
      calculatedAmountInPence: 0,
      code: 'Free',
      version: 0,
    };
    claim.generalApplication.applicationTypes = [{
      option: ApplicationTypeOption.ADJOURN_HEARING,
      isOtherSelected: () => false,
    }];
    claim.generalApplication.agreementFromOtherParty = YesNo.YES;
    claim.generalApplication.informOtherParties = {option: YesNo.YES};
    claim.caseProgressionHearing = new CaseProgressionHearing();
    const updatedClaim = {...claim} as Claim;
    updatedClaim.ccdState = CaseState.HEARING_READINESS;
    updatedClaim.caseProgressionHearing.hearingDate = new Date('2028-08-28');
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(updatedClaim);
    const gaFeeData = await gaApplicationFeeDetails(claim, {} as AppRequest);
    expect(gaFeeDetails).toEqual(gaFeeData);
    expect(gaFeeDetails).toEqual(claim.generalApplication.applicationFee);
  });

  it('should fetch the fee details from Ga case', async () => {
    const gaFeeDetails:CcdFee = {
      calculatedAmountInPence: '1400',
      code: 'Fe124',
      version: '0',
    };
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);

    const gaFeeData = await getGaAppFeeDetails('123', {} as AppRequest);
    expect(gaFeeDetails).toEqual(gaFeeData);
    expect(gaFeeDetails).toEqual(applicationResponse.case_data.generalAppPBADetails.fee);
  });

  it('should fetch the gaAppId from claim', async () => {

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
    const gaAppId = await getGaAppId('123', {} as AppRequest);
    expect(gaAppId).toEqual('gaApp1');

  });

  it('should throw an error when api throws error', async () => {
    const errMessage = new Error('unauthorized');
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockRejectedValueOnce(errMessage);
    gaApplicationFeeDetails(claim, {} as AppRequest).catch((err) => {
      expect(err).toEqual(errMessage);
    });
  });
});

describe('updateHearingDateForGAApplicationFee', () => {
  let claim: Claim, req: AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING)];
    claim.caseProgressionHearing = new CaseProgressionHearing();
    req = {
      params: {id: 'mockClaimId'},
    } as unknown as AppRequest;
  });

  it('should update the claim if conditions are met and state is HEARING_READINESS', async () => {
    const updatedClaim = {...claim, ccdState: CaseState.HEARING_READINESS} as Claim;
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(updatedClaim);

    const result = await updateHearingDateForGAApplicationFee(claim, req);

    expect(CivilServiceClient.prototype.retrieveClaimDetails).toHaveBeenCalledWith('mockClaimId', req);
    expect(result).toEqual({...claim, ...updatedClaim});
  });

  it('should not update the claim if conditions are not met', async () => {
    claim.generalApplication.applicationFee = {calculatedAmountInPence: 100} as ClaimFeeData;
    const result = await updateHearingDateForGAApplicationFee(claim, req);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);
    expect(CivilServiceClient.prototype.retrieveClaimDetails).not.toHaveBeenCalled();
    expect(result).toEqual(claim);
  });

  it('should not update the claim if selectedApplications does not include ADJOURN_HEARING', async () => {
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STRIKE_OUT)];
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);
    const result = await updateHearingDateForGAApplicationFee(claim, req);

    expect(CivilServiceClient.prototype.retrieveClaimDetails).not.toHaveBeenCalled();
    expect(result).toEqual(claim);
  });

  it('should return the original claim if state is not HEARING_READINESS', async () => {
    const updatedClaim = {...claim, ccdState: CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT} as Claim;
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(updatedClaim);

    const result = await updateHearingDateForGAApplicationFee(claim, req);

    expect(CivilServiceClient.prototype.retrieveClaimDetails).toHaveBeenCalledWith('mockClaimId', req);
    expect(result).toEqual(claim);
  });
});
