import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {ClaimFeeData} from 'models/civilClaimResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

export const saveClaimFee = async (req: AppRequest, claimFeeData: ClaimFeeData) => {
  try{
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimFeesService] no draft claim found to update');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data) as unknown as Claim;
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

    claim.claimFee = {
      calculatedAmountInPence: claimFeeData.calculatedAmountInPence,
      code: claimFeeData.code,
      version: claimFeeData.version,
    };

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    await updateDraftClaim(req, claim, draftId);
  }catch(error){
    logger.error(error);
    throw error;
  }
};
