import {FixedCosts} from 'form/models/claimDetails';

export interface CcdFixedCost {
  fixedCostAmount: string;
  claimFixedCosts: string;

}
export const toCCDFixedCost = (fixedCost: FixedCosts) => {
  if (!fixedCost) return undefined;
  const ccdFixedCost  = {
    fixedCostAmount: fixedCost.fixedCostAmount,
    claimFixedCosts: fixedCost.claimFixedCosts,
  };
  return ccdFixedCost;

};
