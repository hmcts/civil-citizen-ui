import {AppRequest} from 'common/models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {YesNo} from 'form/models/yesNo';
import {Interest} from 'form/models/interest/interest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getClaimInterest = async (req: AppRequest): Promise<GenericYesNo> => {
  try {
    const caseData = await getDraftClaim(req);
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

export const saveClaimInterest = async (req: AppRequest, claimInterest: YesNo) => {
  try {
    const caseData = await getDraftClaim(req);
    caseData.claimInterest = claimInterest;
    if(claimInterest === YesNo.NO) {
      caseData.interest = new Interest();
    }
    await updateDraftClaim(req, caseData, req.session?.draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
