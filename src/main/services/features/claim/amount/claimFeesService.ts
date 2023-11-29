import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimFeeData} from 'models/civilClaimResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');
export const saveClaimFee = async (claimantId: string, claimFeeData: ClaimFeeData) => {
  try{
    const claim = await getCaseDataFromStore(claimantId);
    claim.claimFee = {
      calculatedAmountInPence: claimFeeData.calculatedAmountInPence,
      code: claimFeeData.code,
      version: claimFeeData.version,
    };
    await saveDraftClaim(claimantId, claim);
  }catch(error){
    logger.error(error);
    throw error;
  }
};
