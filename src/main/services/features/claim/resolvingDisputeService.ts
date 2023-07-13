import {
  getCaseDataFromStore,
  saveDraftClaim,
} from "modules/draft-store/draftStoreService";

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('saveResolvingDisputeService');

export const saveResolvingDispute = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.resolvingDispute = true;
    console.log('claim', claim);
    // saveForm(claim, form, citizenType);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};