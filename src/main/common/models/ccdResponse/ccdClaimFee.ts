import {ClaimFee} from 'form/models/claimDetails';

export interface CCDClaimFee {
  calculatedAmountInPence: string;
  code?: string,
  version?: string,

}
export const toCCDClaimFee = (claimFee: ClaimFee) => {
  if (!claimFee?.calculatedAmountInPence) return undefined;
  const ccdClaimFee  = {
    calculatedAmountInPence: claimFee.calculatedAmountInPence.toString(),
    version: claimFee.version !== undefined ? claimFee.version.toString() : undefined,
    code: claimFee.code,
  };
  return ccdClaimFee;

};
