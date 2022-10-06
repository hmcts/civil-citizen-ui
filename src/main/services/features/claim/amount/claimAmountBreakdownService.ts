import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from "common/form/models/claim/amount/claimAmountRow";
import {ClaimAmountBreakup} from "common/form/models/claimDetails";

export const getClaimAmountBreakdownForm = async (claimantId: string) : Promise<AmountBreakdown> => {
  const claim = await getCaseDataFromStore(claimantId);
  if(!claim.claimAmountBreakup){
    return AmountBreakdown.emptyForm();
  }
  return AmountBreakdown.fromJsonArray(claim.claimAmountBreakup);
};

export const saveClaimAmountBreakdownForm = async (claimantId: string, amountBreakdown: AmountBreakdown) => {
  const claim = await getCaseDataFromStore(claimantId);
  claim.claimAmountBreakup = amountBreakdown.claimAmountRows.map((row)=> convertFormToJson(row));
  await saveDraftClaim(claimantId, claim);
};

const convertFormToJson = (form: ClaimAmountRow): ClaimAmountBreakup =>{
  return {
    value:{
      claimAmount: form.amount.toString(),
      claimReason: form.reason,
    },
  };
};
