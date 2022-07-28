import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Defence} from '../../../common/form/models/defence';
import {RejectAllOfClaim} from '../../../common/form/models/rejectAllOfClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('yourDefenceService');

export const saveYourDefence = async (claimId: string, form: Defence) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim?.rejectAllOfClaim) {
      claim.rejectAllOfClaim = new RejectAllOfClaim();
    }
    claim.rejectAllOfClaim.defence = new Defence(form.text);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
