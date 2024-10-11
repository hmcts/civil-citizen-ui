import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from '../../../../common/form/models/claim/amount/claimAmountRow';
import {ClaimAmountBreakup} from '../../../../common/form/models/claimDetails';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

export const getClaimAmountBreakdownForm = async (claimantId: string) : Promise<AmountBreakdown> => {
  try{
    const claim = await getCaseDataFromStore(claimantId);
    if(!claim.claimAmountBreakup){
      return AmountBreakdown.emptyForm();
    }
    return AmountBreakdown.fromJsonArray(claim.claimAmountBreakup);
  }catch(error){
    logger.error(error);
    throw error;
  }

};

export const saveClaimAmountBreakdownForm = async (claimantId: string, amountBreakdown: AmountBreakdown) => {
  try{
    let totalClaimAmount = 0;
    const claim = await getCaseDataFromStore(claimantId);
    claim.claimAmountBreakup = amountBreakdown.getPopulatedRows().map((row) => {
      totalClaimAmount = totalClaimAmount + row.amount;
      return convertFormToJson(row);
    });
    claim.totalClaimAmount = totalClaimAmount;
    await saveDraftClaim(claimantId, claim);
  }catch(error){
    logger.error(error);
    throw error;
  }
};

const convertFormToJson = (form: ClaimAmountRow): ClaimAmountBreakup =>{
  return {
    value:{
      claimAmount: form.amount.toString(),
      claimReason: form.reason,
    },
  };
};
