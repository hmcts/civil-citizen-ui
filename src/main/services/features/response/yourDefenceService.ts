import {saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Defence} from '../../../common/form/models/defence';
import {RejectAllOfClaim} from '../../../common/form/models/rejectAllOfClaim';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('yourDefenceService');

export const saveYourDefence = async (claim: Claim, claimId: string, form: Defence) => {
  try {

    if (!claim.rejectAllOfClaim) {
      claim.rejectAllOfClaim = new RejectAllOfClaim();
    }
    claim.rejectAllOfClaim.defence = new Defence(form.text);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
