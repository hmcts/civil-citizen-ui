import {Claim} from 'common/models/claim';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const checkIfClaimFeeHasChanged = async (claimId: string, claim: Claim, req: AppRequest) => {
  const newClaimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount, req);
  const oldClaimFee = claim.claimFee?.calculatedAmountInPence;
  return oldClaimFee !== newClaimFeeData?.calculatedAmountInPence;
};
