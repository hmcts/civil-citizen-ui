import {ClaimFee} from 'form/models/claimDetails';

export interface CCDHearingFeeFee {
  calculatedAmountInPence: string;
  code?: string,
  version?: string,
}
export const toCCDClaimFee = (claimFee: ClaimFee) => {
  if (!claimFee?.calculatedAmountInPence) return undefined;
  return {
    calculatedAmountInPence: claimFee.calculatedAmountInPence.toString(),
  };

};
