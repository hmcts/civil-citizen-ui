import { CivilServiceClient } from 'client/civilServiceClient';
import { YesNo } from 'common/form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { ClaimFeeData } from 'common/models/civilClaimResponse';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import config from 'config';
import { generateRedisKey, saveDraftClaim } from 'modules/draft-store/draftStoreService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const feeRequestBody = (applicationTypes: ApplicationType[], withConsent: YesNo, withNotice: YesNo): { applicationTypes: ApplicationTypeOption[], withConsent: boolean, withNotice: boolean } => {
  const selectedApplicationTypes = applicationTypes.map(applicationType => applicationType.option);
  return {
    applicationTypes: selectedApplicationTypes,
    withConsent: withConsent === YesNo.YES,
    withNotice: withNotice === YesNo.YES
  }
}


export const gaApplicationFeeDetails = async (claim: Claim, req: AppRequest): Promise<ClaimFeeData> => {
  try {
    const gaDetails = claim.generalApplication;
    const gaFeeData = await civilServiceClient.getGeneralApplicationFee(feeRequestBody(gaDetails?.applicationTypes, gaDetails.agreementFromOtherParty, gaDetails?.informOtherParties?.option as YesNo), req);

    if (gaFeeData) {
      claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
      claim.generalApplication.applicationFee = gaFeeData;
      saveDraftClaim(generateRedisKey(req), claim);
      console.debug(gaFeeData);
      return gaFeeData;
    }
  } catch (error) {
    throw error;
  }
}
