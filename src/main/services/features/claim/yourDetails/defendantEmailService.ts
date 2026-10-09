import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {DefendantEmail} from '../../../../common/form/models/claim/yourDetails/defendantEmail';
import {Party} from '../../../../common/models/party';
import {Email} from '../../../../common/models/Email';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantEmailAsService');

const getDefendantEmail = async (req: AppRequest) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[defendantEmailService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
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
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[defendantEmailService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    if (!claim.respondent1) {
      claim.respondent1 = new Party();
    }
    claim.respondent1.emailAddress = new Email(form.emailAddress);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getDefendantEmail,
  saveDefendantEmail,
};
