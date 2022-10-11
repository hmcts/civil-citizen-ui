import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {InterestClaimFromSelection} from '../../../../common/form/models/claim/interest/interestClaimFromSelection';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantInterestFromAsService');

const getClaimantInterestFrom = async (claimId:string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.interestClaimFrom) {
      return new InterestClaimFromSelection(claim.interestClaimFrom);
    }
    return new InterestClaimFromSelection();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantInterestFrom = async (claimId:string,form: InterestClaimFromSelection) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.interestClaimFrom = form.option;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimantInterestFrom,
  saveClaimantInterestFrom,
};
