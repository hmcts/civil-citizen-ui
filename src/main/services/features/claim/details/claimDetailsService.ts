import {
  getCaseDataFromStore,
  // saveDraftClaim,
  saveDraftClaimX
} from '../../../../modules/draft-store/draftStoreService';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {Claim} from '../../../../common/models/claim';

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
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.claimDetails) {
      claim.claimDetails[claimDetailsPropertyName as keyof ClaimDetails] = value;
    } else {
      const claimDetails: ClaimDetails = new ClaimDetails();
      claimDetails[claimDetailsPropertyName as keyof ClaimDetails] = value;
      claim.claimDetails = claimDetails;
    }
    await saveDraftClaimX(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimDetails,
  saveClaimDetails,
};
