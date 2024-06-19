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
  const feeRequestDetails = feeRequestBody(claim.generalApplication, claim?.caseProgressionHearing?.hearingDate);
  const gaFeeData = await civilServiceClient.getGeneralApplicationFee(feeRequestDetails, req);
  if (gaFeeData) {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.applicationFee = gaFeeData;
    saveDraftClaim(generateRedisKey(req), claim);
    return gaFeeData;
  }
};
