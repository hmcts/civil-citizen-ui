import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {
  addDaysToDate,
  formatDateToFullDate,
  getNumberOfDaysBetweenTwoDays, isAfter4PM,
} from './dateUtils';
import {InterestClaimFromType} from 'form/models/claimDetails';
import {getLng} from 'common/utils/languageToggleUtils';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {translateDraftClaimToCCD} from 'services/translation/claim/ccdTranslation';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const INTEREST_8 = 8;

export const getInterestDetails = async (claim: Claim, req: AppRequest) => {
  if (claim?.claimInterest === YesNo.NO) {
    return undefined;
  }
  const interestFromDate = getInterestDateOrIssueDate(claim);
  const interestToDate = getInterestToDate(claim);
  const numberOfDays = getNumberOfDaysBetweenTwoDays(interestFromDate, interestToDate);
  const rate = getInterestRate(claim);
  const interest = await calculateInterestToDate(claim, req);

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

export const calculateInterestToDate = async (claim: Claim, req: AppRequest): Promise<number> => {
  const caseData = translateDraftClaimToCCD(claim, req);
  return await civilServiceClient.calculateClaimInterest(caseData, req);
};

export const calculateInterest = (amount: number, interest: number, startDate: Date, endDate: Date): number => {
  const days = Math.abs(getNumberOfDaysBetweenTwoDays(startDate, endDate));
  const interestForPerYear = amount * (interest / 100);
  const interestForPerDay = (interestForPerYear / 365).toFixed(2);
  return Number(interestForPerDay) * days;
};

export const getInterestData = async (claim: Claim, lang: string, req: AppRequest) => {
  let interestStrtDate = getInterestStartDate(claim);
  const interestEndDate1 = getInterestEndDate(claim);
  if (claim.isInterestFromClaimSubmitDate()) {
    interestStrtDate = isAfter4PM(interestStrtDate) ? addDaysToDate(interestStrtDate, 1) : interestStrtDate;
  }
  const endDate = isAfter4PM(interestEndDate1) ? addDaysToDate(interestEndDate1, 2) : addDaysToDate(interestEndDate1, 1);
  const numberOfDays = Math.abs(getNumberOfDaysBetweenTwoDays(interestStrtDate, endDate));
  const interestStartDate = formatDateToFullDate(interestStrtDate, getLng(lang));
  const interestToDate = (await calculateInterestToDate(claim, req)).toFixed(2);
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
