import {ClaimantResponse} from '../../../common/models/claimantResponse';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {RejectionReason} from '../../../common/form/models/claimantResponse/rejectionReason';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('rejectionReasonService');

export const getRejectionReason = async (claimId: string): Promise<RejectionReason> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.claimantResponse?.rejectionReason) {
      return claim.claimantResponse.rejectionReason;
    }
    return new RejectionReason();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRejectionReason = async (claimId: string, reason: RejectionReason) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.claimantResponse) {
      claim.claimantResponse.rejectionReason = reason;
    } else {
      const claimantResponse = new ClaimantResponse();
      claimantResponse.rejectionReason = reason;
      claim.claimantResponse = claimantResponse;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
