import {GenericYesNo} from 'form/models/genericYesNo';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {YesNo} from 'form/models/yesNo';
import {Interest} from 'form/models/interest/interest';

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
  return new GenericYesNo(claimInterest, 'ERRORS.CLAIM_INTEREST_REQUIRED');
};

export const saveClaimInterest = async (claimId: string, claimInterest: YesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.claimInterest = claimInterest;
    if(claimInterest === YesNo.NO) {
      caseData.interest = new Interest();
    }
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
