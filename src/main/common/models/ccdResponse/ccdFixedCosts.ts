import {FixedCosts} from 'form/models/claimDetails';

export interface CcdFixedCosts {
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
