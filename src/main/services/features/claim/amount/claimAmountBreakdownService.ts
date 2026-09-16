import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from '../../../../common/form/models/claim/amount/claimAmountRow';
import {ClaimAmountBreakup} from '../../../../common/form/models/claimDetails';
import {roundOffTwoDecimals} from 'common/utils/dateUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

export const getClaimAmountBreakdownForm = async (req: AppRequest) : Promise<AmountBreakdown> => {
  try{
    const claim = await getDraftClaim(req);
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
    const claim = await getDraftClaim(req);
    claim.claimAmountBreakup = amountBreakdown.getPopulatedRows().map((row) => {
      totalClaimAmount = totalClaimAmount + row.amount;
      return convertFormToJson(row);
    });
    claim.totalClaimAmount = roundOffTwoDecimals(totalClaimAmount);
    await updateDraftClaim(req, claim, req.session?.draftId);
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
