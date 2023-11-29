import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {convertToPence} from 'services/translation/claim/moneyConversation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');
export const saveClaimFee = async (claimId: string, claimFee: number) => {
  try{
    const claim = await getCaseDataFromStore(claimId);
    claim.claimFee = {calculatedAmountInPence: convertToPence(claimFee)};
    await saveDraftClaim(claimId, claim);
  }catch(error){
    logger.error(error);
    throw error;
  }
};
