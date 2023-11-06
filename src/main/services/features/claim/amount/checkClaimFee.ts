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

  const currentClaimFee = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, req);
  if (convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence) !== currentClaimFee) {
    await saveClaimFee(generateRedisKey(req), currentClaimFee);
    return true;
  } else {
    return false;
  }

};
