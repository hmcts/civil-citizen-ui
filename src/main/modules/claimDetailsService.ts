import {Claim} from '../common/models/claim';
import {convertToPoundsFilter} from '../common/utils/currencyFormat';
import {ResponseType} from '../common/form/models/responseType';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import {AppRequest} from 'models/AppRequest';

export const getTotalAmountWithInterestAndFees = async (claim: Claim, req: AppRequest) => {
  let interestToDate = 0;
  if (claim.hasInterest()) {
    interestToDate = await calculateInterestToDate(claim, req);
  }
  return (claim.totalClaimAmount || 0) + interestToDate + (convertToPoundsFilter(claim?.claimFee?.calculatedAmountInPence) || 0);
};

export const isFullAmountReject = (claim: Claim): boolean => {
  return claim.respondent1.responseType === ResponseType.PART_ADMISSION || claim.respondent1.responseType === ResponseType.FULL_DEFENCE;
};
