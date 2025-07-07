import {CCJPaymentDetails} from 'form/models/claimDetails';

export interface CcdCCJPaymentDetails {
  ccjJudgmentFixedCostAmount: string;

}
export const toCCDccjPaymentDetails = (ccjPaymentDetails: CCJPaymentDetails) => {
  if (!ccjPaymentDetails) return undefined;
  const ccdCCJPaymentDetails  = {
    ccjJudgmentFixedCostAmount: ccjPaymentDetails.ccjJudgmentFixedCostAmount,
  };
  return ccdCCJPaymentDetails;

};
