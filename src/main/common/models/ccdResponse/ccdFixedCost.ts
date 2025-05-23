import {FixedCost} from 'form/models/claimDetails';

export interface CcdFixedCost {
  fixedCostAmount: string;
  claimFixedCosts: string;

}
export const toCCDFixedCost = (fixedCost: FixedCost) => {
  if (!fixedCost?.calculatedAmountInPence) return undefined;
  const ccdFixedCost  = {
    fixedCostAmount: fixedCost.fixedCostAmount,
    claimFixedCosts: fixedCost.claimFixedCosts,
  };
  return ccdFixedCost;

};
