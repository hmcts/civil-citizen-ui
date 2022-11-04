import {ClaimantResponse} from '../../../common/models/claimantResponse/claimantResponse';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

const getClaimantResponse = async (claimId: string): Promise<ClaimantResponse> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    return (claim.claimantResponse) ? claim.claimantResponse : new ClaimantResponse();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantResponse = async (claimId: string, value: any, claimantResponsePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.claimantResponse) {
      if (parentPropertyName && claim.claimantResponse[parentPropertyName]) {
        claim.claimantResponse[parentPropertyName][claimantResponsePropertyName] = value;
      } else if (parentPropertyName && !claim.claimantResponse[parentPropertyName]) {
        claim.claimantResponse[parentPropertyName] = {[claimantResponsePropertyName]: value};
      }else {
        claim.claimantResponse[claimantResponsePropertyName] = value;
      }
    } else {
      const claimantResponse: any = new ClaimantResponse();
      if (parentPropertyName) {
        claimantResponse[parentPropertyName] = {[claimantResponsePropertyName]: value};
      } else {
        claimantResponse[claimantResponsePropertyName] = value;
      }

      claim.claimantResponse = claimantResponse;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimantResponse,
  saveClaimantResponse,
};
