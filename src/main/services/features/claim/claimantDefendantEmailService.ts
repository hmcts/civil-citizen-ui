import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ClaimantDefendantEmail} from '../../../common/form/models/claim/claimantDefendantEmail';
import {Respondent} from '../../../common/models/respondent';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantDefendantEmailAsService');

const getClaimantDefendantEmail = async (claimId:string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.respondent1) {
      return new ClaimantDefendantEmail(claim.respondent1.emailAddress);
    }
    return new ClaimantDefendantEmail();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantDefendantEmail = async (claimId:string,form: ClaimantDefendantEmail) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.respondent1) {
      claim.respondent1 = new Respondent();
    }
    claim.respondent1.emailAddress = form.emailAddress;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimantDefendantEmail,
  saveClaimantDefendantEmail,
};
