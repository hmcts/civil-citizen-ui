import {Claim} from '../common/models/claim';
import {convertToPoundsFilter} from '../common/utils/currencyFormat';
import {ResponseType} from '../common/form/models/responseType';

export const getTotalAmountWithInterestAndFees = (claim: Claim) => {
  return claim.totalClaimAmount + claim.totalInterest + convertToPoundsFilter(claim.claimFee.calculatedAmountInPence);
};

export const isFullAmountReject = (claim: Claim): boolean => {
  return claim.respondent1.responseType === ResponseType.PART_ADMISSION || claim.respondent1.responseType === ResponseType.FULL_DEFENCE;
};
