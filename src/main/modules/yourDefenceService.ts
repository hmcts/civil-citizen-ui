import {getCaseDataFromStore, saveDraftClaim} from './draft-store/draftStoreService';
import {Defence} from '../common/form/models/defence';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('yourDefenceService');

export const saveYourDefence = async (claimId: string, form: Defence) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.defence) {
      claim.defence = new Defence();
    }
    claim.defence.text = form.text;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
