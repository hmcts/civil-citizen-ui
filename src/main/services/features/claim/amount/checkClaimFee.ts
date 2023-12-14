import { Claim } from 'common/models/claim';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {saveClaimFee} from 'services/features/claim/amount/claimFeesService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const checkIfClaimFeeHasChanged = async (claimId: string, claim: Claim, req: AppRequest) => {
  const newClaimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount, req);
  const oldClaimFee = claim.claimFee?.calculatedAmountInPence;
  if (oldClaimFee !== newClaimFeeData?.calculatedAmountInPence) {
    await saveClaimFee(generateRedisKey(req), newClaimFeeData);
    return true;
  } else {
    return false;
  }
};
