import { Claim } from 'common/models/claim';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {saveClaimFee} from 'services/features/claim/amount/claimFeesService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const checkIfClaimFeeHasChanged = async (claimId: string, claim: Claim, req: AppRequest) => {
  const newClaimFee = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, req);
  const oldClaimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
  if (oldClaimFee !== newClaimFee) {
    await saveClaimFee(generateRedisKey(req), newClaimFee);
    return true;
  } else {
    return false;
  }
};
