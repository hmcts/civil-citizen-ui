import { CivilServiceClient } from 'client/civilServiceClient';
import { YesNo } from 'common/form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { ClaimFeeData } from 'common/models/civilClaimResponse';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { convertDateToStringFormat } from 'common/utils/dateUtils';
import config from 'config';
import { generateRedisKey, saveDraftClaim } from 'modules/draft-store/draftStoreService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {CcdFee} from 'models/ccdGeneralApplication/ccdGeneralApplicationPBADetails';
import {CaseState} from 'form/models/claimDetails';
export interface GAFeeRequestBody {
  applicationTypes: ApplicationTypeOption[],
  withConsent: boolean,
  withNotice: boolean,
  hearingDate: string
}

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const feeRequestBody = (gaDetails: GeneralApplication, hearingDate: Date): GAFeeRequestBody => {
  const selectedApplicationTypes = gaDetails.applicationTypes.map(applicationType => applicationType.option);
  return {
    applicationTypes: selectedApplicationTypes,
    withConsent: gaDetails?.agreementFromOtherParty === YesNo.YES,
    withNotice: gaDetails?.informOtherParties?.option === YesNo.YES,
    hearingDate: hearingDate ? convertDateToStringFormat(hearingDate) : null,
  };
};

export const gaApplicationFeeDetails = async (claim: Claim, req: AppRequest): Promise<ClaimFeeData> => {
  claim = await updateHearingDateForGAApplicationFee(claim, req);
  const feeRequestDetails = feeRequestBody(claim.generalApplication, claim?.caseProgressionHearing?.hearingDate);
  const gaFeeData = await civilServiceClient.getGeneralApplicationFee(feeRequestDetails, req);
  if (gaFeeData) {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.applicationFee = gaFeeData;
    saveDraftClaim(generateRedisKey(req), claim);
    return gaFeeData;
  }
};

export const updateHearingDateForGAApplicationFee = async (claim: Claim, req: AppRequest) => {
  const selectedApplications = claim.generalApplication.applicationTypes.map(applicationType => applicationType.option);
  const isAllowedToUpdateClaim = !claim?.caseProgressionHearing?.hearingDate && !claim.generalApplication?.applicationFee && selectedApplications.includes(ApplicationTypeOption.ADJOURN_HEARING);
  if (isAllowedToUpdateClaim) {
    const updatedClaim = await civilServiceClient.retrieveClaimDetails(req.params?.id, req);
    if (updatedClaim.ccdState === CaseState.HEARING_READINESS) {
      return Object.assign(claim, updatedClaim);
    }
  }
  return claim;
};

export const getGaAppFeeDetails = async (claimId: string, req: AppRequest): Promise<CcdFee> => {
  const genAppId = await getGaAppId(claimId, req);
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, genAppId);
  return applicationResponse.case_data.generalAppPBADetails?.fee;
};

export const getGaAppId = async (claimId: string, req: AppRequest): Promise<string> => {

  const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  const ccdGeneralApplications = ccdClaim.generalApplications;
  return ccdGeneralApplications[ccdGeneralApplications.length-1].value.caseLink.CaseReference;

};

