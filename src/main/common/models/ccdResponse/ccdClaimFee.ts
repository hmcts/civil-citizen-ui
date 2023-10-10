import {ClaimFee} from 'form/models/claimDetails';

export interface CCDClaimFee {
  calculatedAmountInPence: string;
  code?: string,
  version?: string,

}
export const toCCDClaimFee = (claimFee: ClaimFee) => {
  if (!claimFee || !claimFee.calculatedAmountInPence) return undefined;
  return {
    calculatedAmountInPence: claimFee.calculatedAmountInPence.toString(),
  };

};
