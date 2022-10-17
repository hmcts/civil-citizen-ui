import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimDetailsService');

const getClaimDetails = async (claimId: string): Promise<ClaimDetails> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return Object.assign(new ClaimDetails(), caseData.claimDetails);

  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimDetails = async (claimId: string, value: any, claimDetailsPropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.claimDetails) {
      claim.claimDetails[claimDetailsPropertyName] = value;
    } else {
      const claimDetails: any = new ClaimDetails();
      claimDetails[claimDetailsPropertyName] = value;
      claim.claimDetails = claimDetails;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimDetails,
  saveClaimDetails,
};
