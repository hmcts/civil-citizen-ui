import {Claim} from '../models/claim';
import {YesNo} from '../form/models/yesNo';
import {formatDateToFullDate, getNumberOfDaysBetweenTwoDays} from './dateUtils';
import {InterestClaimFromType} from '../../common/form/models/claimDetails';
import {InterestClaimOptionsType} from '../../common/form/models/claim/interest/interestClaimOptionsType';
import {getLng} from 'common/utils/languageToggleUtils';

const INTEREST_8 = 8;

export const getInterestDetails = (claim: Claim) => {
  if (claim?.claimInterest === YesNo.NO) {
    return undefined;
  }
  const interestFromDate = getInterestDateOrIssueDate(claim);
  const interestToDate = getInterestToDate(claim);
  const numberOfDays = getNumberOfDaysBetweenTwoDays(interestFromDate, interestToDate);
  const rate = getInterestRate(claim);
  const interest = claim?.totalInterest;

  return {interestFromDate, interestToDate, numberOfDays, interest, rate};
};

function getInterestToDate(claim: Claim) {
  let interestToDate: Date | string = new Date().toISOString();
  if (claim?.isInterestEndDateUntilSubmitDate()) {
    interestToDate = claim.submittedDate;
  }
  return interestToDate;
}

export function getInterestDateOrIssueDate(claim: Claim) {
  let interestFromDate = claim?.issueDate;
  if (claim.isInterestFromClaimSubmitDate()) {
    interestFromDate = claim.submittedDate;
  } else if (claim.isInterestFromASpecificDate()) {
    interestFromDate = claim.interest?.interestStartDate.date;
  }
  return interestFromDate;
}

export function getInterestRate(claim: Claim): number {
  let interestRate = INTEREST_8;
  if (!claim.isSameRateTypeEightPercent()) {
    interestRate = claim.interest?.sameRateInterestSelection?.differentRate;
  }
  return interestRate;
}

export const calculateInterestToDate = (claim: Claim): number => {
  if (claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST) {
    return claim.interest.totalInterest?.amount;
  }
  const interestPercent = getInterestRate(claim);
  const interestStartDate = getInterestStartDate(claim);
  const interest = calculateInterest(
    claim.totalClaimAmount,
    interestPercent,
    interestStartDate,
    new Date(),
  );
  return (Math.round(interest * 100) / 100);
};

export const getInterestStartDate = (claim: Claim): Date => {
  if (claim.interest?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE) {
    return new Date(claim.interest.interestStartDate?.date);
  }
  return claim.submittedDate ?? new Date();
};

export const calculateInterest = (amount: number, interest: number, startDate: Date, endDate: Date): number => {
  const days = getNumberOfDaysBetweenTwoDays(startDate, endDate);
  return ((amount * (interest / 100)) / 365) * days;
};

export const getInterestData = (claim: Claim, lang: string) => {
  const interestStartDate = formatDateToFullDate(getInterestStartDate(claim), getLng(lang));
  const interestEndDate = formatDateToFullDate(new Date());
  const numberOfDays = getNumberOfDaysBetweenTwoDays(interestStartDate, interestEndDate);
  const interestToDate = calculateInterestToDate(claim).toFixed(2);
  const interestRate = getInterestRate(claim);
  const isBreakDownInterest = claim.isInterestClaimOptionsBreakDownInterest();
  const howInterestIsCalculatedReason = isBreakDownInterest ? claim.getHowTheInterestCalculatedReason() : undefined;

  return {
    interestStartDate,
    interestEndDate,
    numberOfDays,
    interestToDate,
    interestRate,
    isBreakDownInterest,
    howInterestIsCalculatedReason,
  };
};
