import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

export const clearClaimantSuggestion = async (redisKey: string, claim: Claim): Promise<Claim> => {
  try {
    claim.claimantResponse.suggestedPaymentIntention = null;
    claim.claimantResponse.courtProposedPlan = null;
    claim.claimantResponse.courtProposedDate = null;
    await saveDraftClaim(redisKey, claim, true);
    return claim;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
