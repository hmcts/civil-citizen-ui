import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from '../../../../common/form/models/claim/amount/claimAmountRow';
import {ClaimAmountBreakup} from '../../../../common/form/models/claimDetails';
import {roundOffTwoDecimals} from 'common/utils/dateUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

export const getClaimAmountBreakdownForm = async (req: AppRequest) : Promise<AmountBreakdown> => {
  try{
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimAmountBreakdownService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    if(!claim.claimAmountBreakup){
      return AmountBreakdown.emptyForm();
    }
    return AmountBreakdown.fromJsonArray(claim.claimAmountBreakup);
  }catch(error){
    logger.error(error);
    throw error;
  }

};

export const saveClaimAmountBreakdownForm = async (req: AppRequest, amountBreakdown: AmountBreakdown) => {
  try{
    let totalClaimAmount = 0;
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimAmountBreakdownService] no draft claim found');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    claim.claimAmountBreakup = amountBreakdown.getPopulatedRows().map((row) => {
      totalClaimAmount = totalClaimAmount + row.amount;
      return convertFormToJson(row);
    });
    claim.totalClaimAmount = roundOffTwoDecimals(totalClaimAmount);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
  }catch(error){
    logger.error(error);
    throw error;
  }
};

const convertFormToJson = (form: ClaimAmountRow): ClaimAmountBreakup =>{
  return {
    value:{
      claimAmount: form.amount.toFixed(2),
      claimReason: form.reason,
    },
  };
};
