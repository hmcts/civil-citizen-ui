import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {
  addDaysToDate,
  formatDateToFullDate,
  getNumberOfDaysBetweenTwoDays, isAfter4PM,
} from './dateUtils';
import {InterestClaimFromType} from 'form/models/claimDetails';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {getLng} from 'common/utils/languageToggleUtils';

const INTEREST_8 = 8;
const ZERO_INTEREST = 0;

export const getInterestDetails = (claim: Claim) => {
  if (claim?.claimInterest === YesNo.NO) {
    return undefined;
  }
  const interestFromDate = getInterestDateOrIssueDate(claim);
  const interestToDate = getInterestToDate(claim);
  const numberOfDays = getNumberOfDaysBetweenTwoDays(interestFromDate, interestToDate);
  const rate = getInterestRate(claim);
  const interest = calculateInterestToDate(claim);

  return {interestFromDate, interestToDate, numberOfDays, interest, rate};
};

function getInterestToDate(claim: Claim) {
  let interestToDate: Date | string = new Date().toISOString();
  if (claim?.isInterestEndDateUntilSubmitDate()) {
    interestToDate = claim.submittedDate;
  }
  return interestToDate;
}

export function getInterestDateOrIssueDate(claim: Claim) : Date | string {
  let interestFromDate = claim?.issueDate;
  if (claim.isInterestFromClaimSubmitDate()) {
    interestFromDate = claim.submittedDate;
  } else if (claim.isInterestFromASpecificDate()) {
    interestFromDate = claim.interest?.interestStartDate.date;
  }

  return interestFromDate ? new Date(interestFromDate).toISOString() : undefined;
}

export function getInterestRate(claim: Claim): number {
  let interestRate = INTEREST_8;
  if (!claim.isSameRateTypeEightPercent()) {
    interestRate = claim.interest?.sameRateInterestSelection?.differentRate;
  }
  return interestRate;
}

export const getInterestStartDate = (claim: Claim): Date => {
  if (claim.interest?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE) {
    return new Date(claim.interest.interestStartDate?.date);
  }
  return claim.submittedDate ?? new Date();
};

export const getInterestEndDate = (claim: Claim): Date => {
  const interestEndDate = new Date();
  if (claim.isInterestFromASpecificDate() && claim.isInterestEndDateUntilSubmitDate()) {
    return  claim?.submittedDate ?? interestEndDate;
  }
  return interestEndDate;
};

export const calculateInterestToDate = (claim: Claim): number => {
  if (claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST) {
    return claim.interest.totalInterest?.amount;
  }
  else if (claim.interest?.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST) {
    const interestPercent = getInterestRate(claim);
    let interestEndDate = getInterestEndDate(claim);
    let interestStartDate;
    const startDate = getInterestStartDate(claim);

    if (claim.isInterestFromClaimSubmitDate()) {
      interestStartDate = isAfter4PM(startDate) ? addDaysToDate(startDate, 1) : startDate;
    } else if (claim.isInterestFromASpecificDate()) {
      interestStartDate = startDate;
    }
    interestEndDate = isAfter4PM(interestEndDate) ? addDaysToDate(interestEndDate, 2): addDaysToDate(interestEndDate, 1);
    const interest = calculateInterest(
      claim.totalClaimAmount,
      interestPercent,
      interestStartDate,
      interestEndDate,
    );

    return (Math.round(interest * 100) / 100);
  }

  return ZERO_INTEREST;
};

export const calculateInterest = (amount: number, interest: number, startDate: Date, endDate: Date): number => {
  const days = Math.abs(getNumberOfDaysBetweenTwoDays(startDate, endDate));
  const interestForPerYear = amount * (interest / 100);
  const interestForPerDay = (interestForPerYear / 365).toFixed(2);
  return Number(interestForPerDay) * days;
};

export const getInterestData = (claim: Claim, lang: string) => {
  let interestStrtDate = getInterestStartDate(claim);
  const interestEndDate1 = getInterestEndDate(claim);
  let endDate;
  if (claim.isInterestFromClaimSubmitDate()) {
    interestStrtDate = isAfter4PM(interestStrtDate) ? addDaysToDate(interestStrtDate, 1) : interestStrtDate;
    endDate = isAfter4PM(interestEndDate1) ? addDaysToDate(interestEndDate1, 1) : interestEndDate1;
  } else {
    endDate = isAfter4PM(interestEndDate1) ? addDaysToDate(interestEndDate1, 2) : addDaysToDate(interestEndDate1, 1);
  }
  const numberOfDays = Math.abs(getNumberOfDaysBetweenTwoDays(interestStrtDate, endDate));
  const interestStartDate = formatDateToFullDate(interestStrtDate, getLng(lang));
  const interestToDate = calculateInterestToDate(claim).toFixed(2);
  const interestRate = getInterestRate(claim);
  const isBreakDownInterest = claim.isInterestClaimOptionsBreakDownInterest();
  const howInterestIsCalculatedReason = isBreakDownInterest ? claim.getHowTheInterestCalculatedReason() : undefined;
  const interestEndDate = formatDateToFullDate(isAfter4PM(interestEndDate1) ? addDaysToDate( interestEndDate1, 1) : interestEndDate1, getLng(lang));

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
