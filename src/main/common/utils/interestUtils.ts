import {Claim} from '../models/claim';
import {YesNo} from '../form/models/yesNo';
import {getNumberOfDaysBetweenTwoDays} from './dateUtils';

const INTEREST_8: number = 8;

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
  if (!claim.isSameRateTypeEightPercent) {
    interestRate = claim.interest?.sameRateInterestSelection?.differentRate; 
  };
  return interestRate
}
