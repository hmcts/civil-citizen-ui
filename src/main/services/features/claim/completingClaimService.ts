import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {updateDraftClaim, getDraftClaim} from 'modules/draft-store/draftStoreManagerService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('completingClaimService');

export const  saveCompletingClaim = async (req: AppRequest): Promise<void> => {
  try {
    const draftResult = await getDraftClaim(req);
    if(!draftResult) {
      throw new Error('[completingClaimService] no draft claim found to update');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    claim.completingClaimConfirmed = true;

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
