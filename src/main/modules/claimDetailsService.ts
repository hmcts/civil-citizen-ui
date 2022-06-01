import {Claim} from '../common/models/claim';
import {convertToPoundsFilter} from '../common/utils/currencyFormat';

export const getTotalAmountWithInterestAndFees = (claim: Claim) => {
  return claim.totalClaimAmount + claim.totalInterest + convertToPoundsFilter(claim.claimFee.calculatedAmountInPence);
};
