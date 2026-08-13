import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {DefendantEmail} from '../../../../common/form/models/claim/yourDetails/defendantEmail';
import {Party} from '../../../../common/models/party';
import {Email} from '../../../../common/models/Email';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantEmailAsService');

const getDefendantEmail = async (req: AppRequest) => {
  try {
    const claim = await getClaimFromDraft(req);
    if (claim.respondent1) {
      return new DefendantEmail(claim.respondent1.emailAddress?.emailAddress);
    }
    return new DefendantEmail();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveDefendantEmail = async (req: AppRequest, form: DefendantEmail) => {
  try {
    const claim = await getClaimFromDraft(req);
    if (!claim.respondent1) {
      claim.respondent1 = new Party();
    }
    claim.respondent1.emailAddress = new Email(form.emailAddress);
    await updateDraftClaim(req, claim, req.session?.draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getDefendantEmail,
  saveDefendantEmail,
};
