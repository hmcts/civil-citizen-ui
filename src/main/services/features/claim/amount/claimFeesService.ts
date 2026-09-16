import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {ClaimFeeData} from 'models/civilClaimResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');
export const saveClaimFee = async (req: AppRequest, claimFeeData: ClaimFeeData) => {
  try{
    const claim = await getDraftClaim(req);
    claim.claimFee = {
      calculatedAmountInPence: claimFeeData.calculatedAmountInPence,
      code: claimFeeData.code,
      version: claimFeeData.version,
    };
    await updateDraftClaim(req, claim, req.session?.draftId);
  }catch(error){
    logger.error(error);
    throw error;
  }
};
