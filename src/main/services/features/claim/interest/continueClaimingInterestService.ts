import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {VALID_YES_NO_SELECTION} from '../../../../common/form/validationErrors/errorMessageConstants';
import {YesNo} from '../../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getContinueClaimingInterest = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.continueClaimingInterest?
      new GenericYesNo(caseData.continueClaimingInterest) :
      new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getContinueClaimingInterestForm = (continueClaimingInterest: string): GenericYesNo => {
  return new GenericYesNo(continueClaimingInterest, VALID_YES_NO_SELECTION);
};

export const saveContinueClaimingInterest = async (claimId: string, continueClaimingInterest: YesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.continueClaimingInterest = continueClaimingInterest;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

