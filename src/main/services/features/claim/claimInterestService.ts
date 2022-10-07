import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {VALID_YES_NO_SELECTION} from '../../../common/form/validationErrors/errorMessageConstants';
import {YesNo} from '../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getClaimInterest = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.claimInterest?
      new GenericYesNo(caseData.claimInterest) :
      new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getClaimInterestForm = (claimInterest: string): GenericYesNo => {
  return new GenericYesNo(claimInterest, VALID_YES_NO_SELECTION);
};

export const saveClaimInterest = async (claimId: string, claimInterest: YesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.claimInterest = claimInterest;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
