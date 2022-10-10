import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {DefendantEmail} from '../../../../common/form/models/claim/yourDetails/defendantEmail';
import {Respondent} from '../../../../common/models/respondent';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantEmailAsService');

const getDefendantEmail = async (claimId:string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.respondent1) {
      return new DefendantEmail(claim.respondent1.emailAddress);
    }
    return new DefendantEmail();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveDefendantEmail = async (claimId:string,form: DefendantEmail) => {
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
  getDefendantEmail,
  saveDefendantEmail,
};
