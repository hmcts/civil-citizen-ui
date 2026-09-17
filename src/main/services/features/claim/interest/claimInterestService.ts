import {GenericYesNo} from 'form/models/genericYesNo';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {Interest} from 'form/models/interest/interest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getClaimInterest = async (req: AppRequest): Promise<GenericYesNo> => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimInterestService] no draft claim found');
    }
    const caseData = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
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
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimInterestService] no draft claim found');
    }
    const caseData = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    caseData.claimInterest = claimInterest;
    if(claimInterest === YesNo.NO) {
      caseData.interest = new Interest();
    }
    if (draftResult.createdAt && !caseData.draftClaimCreatedAt) {
      caseData.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, caseData, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
