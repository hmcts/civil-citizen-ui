import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {convertToPence} from 'services/translation/claim/moneyConversation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');
export const saveClaimFee = async (claimantId: string, claimFee: number) => {
  try{
    const claim = await getCaseDataFromStore(claimantId);
    claim.claimFee = {calculatedAmountInPence: convertToPence(claimFee)};
    await saveDraftClaim(claimantId, claim);
  }catch(error){
    logger.error(error);
    throw error;
  }
};
