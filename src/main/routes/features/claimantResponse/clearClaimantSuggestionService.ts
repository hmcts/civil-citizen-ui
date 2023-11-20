import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

export const clearClaimantSuggestion = async (claimId: string, claim: Claim) => {
  try {
    claim.claimantResponse.suggestedPaymentIntention = null;
    claim.claimantResponse.courtProposedPlan = null;
    claim.claimantResponse.courtProposedDate = null;
    await saveDraftClaim(claimId, claim, true);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
