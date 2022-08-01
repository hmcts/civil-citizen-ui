import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {RejectAllOfClaim} from '../../../common/form/models/rejectAllOfClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('rejectAllOfClaimService');

export const getRejectAllOfClaim = async (claimId: string): Promise<RejectAllOfClaim> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.rejectAllOfClaim) {
      return new RejectAllOfClaim(claim.rejectAllOfClaim.option);
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
    claim.rejectAllOfClaim.option = form.option;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
