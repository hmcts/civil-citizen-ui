import {AppRequest} from 'common/models/AppRequest';
import {updateDraftClaim, getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('completingClaimService');

export const  saveCompletingClaim = async (req: AppRequest): Promise<void> => {
  try {
    const draftId = req.session?.draftId;
    if (!draftId) {
      throw new Error('[completingClaimService] draftId is missing from session');
    }

    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[completingClaimService] no draft claim found for user');
    }

    const claim = Object.assign<Claim, Record<string, any>>(
      new Claim(),
      draftResult.claimResponse.case_data,
    );
    if (!claim.draftClaimCreatedAt && draftResult.createdAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    claim.completingClaimConfirmed = true;
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(`[completingClaimService] failed to save completing claim: ${error}`);
    throw error;
  }
};
