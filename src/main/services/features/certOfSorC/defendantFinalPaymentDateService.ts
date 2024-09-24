import {ClaimantResponse} from 'models/claimantResponse';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantFinalPaymentDateService');


const getDefendantResponse = async (claimId: string): Promise<ClaimantResponse> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    const claimantResponse = new ClaimantResponse();
    return Object.assign(claimantResponse, claim.claimantResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveFinalPaymentDateResponse = async (claimId: string, value: any, claimantResponsePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId, true);
    await saveDraftClaim(claimId, claim, true);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getDefendantResponse,
  saveFinalPaymentDateResponse,
};
