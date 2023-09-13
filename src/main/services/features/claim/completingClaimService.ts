import {
  getCaseDataFromStore,
  // saveDraftClaim,
  saveDraftClaimX,
} from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('completingClaimService');

export const saveCompletingClaim = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.completingClaimConfirmed = true;
    await saveDraftClaimX(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};