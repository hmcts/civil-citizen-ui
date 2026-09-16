import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {Claim} from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimDetailsService');

const getClaimDetails = async (req: AppRequest): Promise<ClaimDetails> => {
  try {
    const caseData = await getDraftClaim(req);
    return Object.assign(new ClaimDetails(), caseData.claimDetails);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimDetails = async (req: AppRequest, value: any, claimDetailsPropertyName: string): Promise<void> => {
  try {
    const claim: Claim = await getDraftClaim(req);
    if (claim.claimDetails) {
      claim.claimDetails[claimDetailsPropertyName as keyof ClaimDetails] = value;
    } else {
      const claimDetails: ClaimDetails = new ClaimDetails();
      claimDetails[claimDetailsPropertyName as keyof ClaimDetails] = value;
      claim.claimDetails = claimDetails;
    }
    await updateDraftClaim(req, claim, req.session?.draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimDetails,
  saveClaimDetails,
};
