import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {
  addDaysToDate,
  formatDateToFullDate,
  getNumberOfDaysBetweenTwoDays,
  isAfterFourPM,
  minusDaysFromDate,
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

export const calculateInterestToDate = (claim: Claim): number => {
  if (claim.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST) {
    return claim.interest.totalInterest?.amount;
  }
  else if (claim.interest?.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST) {
    const interestPercent = getInterestRate(claim);
    const currentDate = new Date();
    let interestStartDate;

    if (claim.isInterestFromClaimSubmitDate()) {
      interestStartDate = isAfterFourPM(currentDate) ? addDaysToDate(currentDate, 1) : currentDate;
    } else if (claim.isInterestFromASpecificDate() && claim.isInterestEndDateUntilSubmitDate() || claim.isInterestEndDateUntilJudgmentDate()) {
      interestStartDate = isAfterFourPM(currentDate) ? minusDaysFromDate(claim.interest.interestStartDate?.date, 1) : claim.interest.interestStartDate?.date;

    }
    const interest = calculateInterest(
      claim.totalClaimAmount,
      interestPercent,
      interestStartDate,
      new Date(),
    );

    return (Math.round(interest * 100) / 100);
  }

  return ZERO_INTEREST;
};

export const calculateInterest = (amount: number, interest: number, startDate: Date, endDate: Date): number => {
  const days = getNumberOfDaysBetweenTwoDays(startDate, endDate);
  const interestForPerYear = amount * (interest / 100);
  const interestForPerDay = (interestForPerYear / 365).toFixed(2);
  return Number(interestForPerDay) * days;
};

export const getInterestData = (claim: Claim, lang: string) => {
  const interestStrtDate = getInterestStartDate(claim);
  const interestStartDate = formatDateToFullDate(interestStrtDate, getLng(lang));
  const interestEndDate = formatDateToFullDate(new Date(), getLng(lang));
  const numberOfDays = getNumberOfDaysBetweenTwoDays(interestStrtDate, new Date());
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
