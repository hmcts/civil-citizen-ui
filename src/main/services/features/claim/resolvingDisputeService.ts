import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('saveResolvingDisputeService');

export const saveResolvingDispute = async (req: AppRequest) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[resolvingDisputeService] no draft claim found to update');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    claim.resolvingDispute = true;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
