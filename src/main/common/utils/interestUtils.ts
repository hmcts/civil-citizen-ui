import {Claim} from '../models/claim';
import {YesNo} from '../form/models/yesNo';
import {getNumberOfDaysBetweenTwoDays} from './dateUtils';
import {InterestClaimFromType, InterestClaimUntilType, InterestClaimOptions, SameRateInterestType} from '../form/models/claimDetails';

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
  let interestToDate : Date | string = new Date().toISOString();
  if (claim?.interestClaimUntil === InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE) {
    interestToDate = claim.submittedDate;
  }
  return interestToDate;
}

function getInterestDateOrIssueDate(claim: Claim) {
  let interestFromDate = claim?.issueDate;
  if (claim?.interestClaimFrom === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE) {
    interestFromDate = claim.submittedDate;
  } else if (claim?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE) {
    interestFromDate = claim.interestFromSpecificDate;
  }
  return interestFromDate;
}

function getInterestRate(claim: Claim) {
  let interestRate;
  if (claim?.interestClaimOptions === InterestClaimOptions.SAME_RATE_INTEREST) {
    if (claim?.sameRateInterestSelection?.sameRateInterestType !== SameRateInterestType.SAME_RATE_INTEREST_8_PC) {
      interestRate = claim?.sameRateInterestSelection?.differentRate;
    } else if (claim?.sameRateInterestSelection?.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC) {
      interestRate = 8;
    }
  }
  return interestRate;
}

