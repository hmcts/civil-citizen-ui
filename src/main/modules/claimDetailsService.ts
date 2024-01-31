import {Claim} from '../common/models/claim';
import {convertToPoundsFilter} from '../common/utils/currencyFormat';
import {ResponseType} from '../common/form/models/responseType';

export const getTotalAmountWithInterestAndFees = (claim: Claim) => {
  return (claim.totalClaimAmount || 0) + (claim.totalInterest || 0) + (convertToPoundsFilter(claim?.claimFee?.calculatedAmountInPence) || 0);
};

export const isFullAmountReject = (claim: Claim): boolean => {
  return claim.respondent1.responseType === ResponseType.PART_ADMISSION || claim.respondent1.responseType === ResponseType.FULL_DEFENCE;
};
