import {ClaimantIntent} from '../../../common/models/claimantIntent';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantIntentService');

const getClaimantIntent = async (claimId: string): Promise<ClaimantIntent> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    return (claim?.claimantIntent) ? claim.claimantIntent : new ClaimantIntent();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantIntent = async (claimId: string, value: any, claimantIntentPropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.claimantIntent) {
      if (parentPropertyName && claim.claimantIntent[parentPropertyName]) {
        claim.claimantIntent[parentPropertyName][claimantIntentPropertyName] = value;
      } else if (parentPropertyName && !claim.claimantIntent[parentPropertyName]) {
        claim.claimantIntent[parentPropertyName] = {[claimantIntentPropertyName]: value};
      } else {
        claim.claimantIntent[parentPropertyName] = value;
      }
    } else {
      const claimantIntent: any = new ClaimantIntent();
      (parentPropertyName) ?
        claimantIntent[parentPropertyName] = {[claimantIntentPropertyName]: value} :
        claimantIntent[claimantIntentPropertyName] = value;

      claim.claimantIntent = claimantIntent;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimantIntent,
  saveClaimantIntent,
};
