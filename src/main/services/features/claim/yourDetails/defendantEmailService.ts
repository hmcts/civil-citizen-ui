import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {DefendantEmail} from '../../../../common/form/models/claim/yourDetails/defendantEmail';
import {Party} from '../../../../common/models/party';
import {Email} from '../../../../common/models/Email';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantEmailAsService');

const getDefendantEmail = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.respondent1) {
      return new DefendantEmail(claim.respondent1.emailAddress?.emailAddress);
    }
    return new DefendantEmail();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveDefendantEmail = async (claimId: string, form: DefendantEmail) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.respondent1) {
      claim.respondent1 = new Party();
    }
    claim.respondent1.emailAddress = new Email(form.emailAddress);
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
