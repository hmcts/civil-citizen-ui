import {getCaseDataFromStore, saveDraftClaim} from './draft-store/draftStoreService';
import {RejectAllOfClaim} from '../common/form/models/rejectAllOfClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('rejectAllOfClaimService');

export const getRejectAllOfClaim = async (claimId: string): Promise<RejectAllOfClaim> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.rejectAllOfClaim) {
      const rejectAllOfClaim = claim.rejectAllOfClaim;
      return new RejectAllOfClaim(rejectAllOfClaim.option, rejectAllOfClaim.howMuchHaveYouPaid, rejectAllOfClaim.whyDoYouDisagree);
    }
    return new RejectAllOfClaim();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRejectAllOfClaim = async (claimId: string, form: RejectAllOfClaim) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.rejectAllOfClaim) {
      claim.rejectAllOfClaim = new RejectAllOfClaim();
    }
    claim.rejectAllOfClaim = form;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};
