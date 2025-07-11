import {Claim} from '../common/models/claim';
import {convertToPoundsFilter} from '../common/utils/currencyFormat';
import {ResponseType} from '../common/form/models/responseType';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import {YesNo} from 'form/models/yesNo';

export const getTotalAmountWithInterestAndFees = async (claim: Claim) => {
  const interestToDate = await calculateInterestToDate(claim);
  return (claim.totalClaimAmount || 0) + interestToDate + (convertToPoundsFilter(claim?.claimFee?.calculatedAmountInPence) || 0);
};

export const getTotalAmountWithInterestAndFeesAndFixedCost = async (claim: Claim) => {
  const totalWithInterest = await getTotalAmountWithInterestAndFees(claim);
  const fixedCost = await getFixedCost(claim);
  return totalWithInterest + (fixedCost || 0);
};

export const getTotalAmountWithInterest = async (claim: Claim) => {
  const interestToDate = await calculateInterestToDate(claim);
  return (claim.totalClaimAmount || 0) + interestToDate;
};

export const isFullAmountReject = (claim: Claim): boolean => {
  return claim.respondent1.responseType === ResponseType.PART_ADMISSION || claim.respondent1.responseType === ResponseType.FULL_DEFENCE;
};

export const getFixedCost = async (claim: Claim) => {

  if (!claim?.fixedCosts || claim?.fixedCosts?.claimFixedCosts.toLowerCase() === YesNo.NO) {
    return undefined;
  }

  if (claim?.ccjJudgmentFixedCostAmount && +claim?.ccjJudgmentFixedCostAmount > 0) {
    return +claim?.ccjJudgmentFixedCostAmount || 0;
  }
  return convertToPoundsFilter(claim?.fixedCosts?.fixedCostAmount) || 0;
};
