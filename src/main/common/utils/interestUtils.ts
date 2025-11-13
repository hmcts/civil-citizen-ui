import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {
  formatDateToFullDate,
  getNumberOfDaysBetweenTwoDays,
} from './dateUtils';
import {InterestClaimFromType} from 'form/models/claimDetails';
import {getLng} from 'common/utils/languageToggleUtils';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {translateDraftClaimToCCDInterest} from 'services/translation/claim/ccdTranslation';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('interestUtils');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const INTEREST_8 = 8;

export const getInterestDetails = async (claim: Claim) => {
  if (claim?.claimInterest === YesNo.NO) {
    return undefined;
  }
  const interestFromDate = getInterestDateOrIssueDate(claim);
  const interestToDate = getInterestToDate(claim);
  const numberOfDays = getNumberOfDaysBetweenTwoDays(interestFromDate, interestToDate);
  const rate = getInterestRate(claim);
  const interest = await calculateInterestToDate(claim);

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
export const correctInterestSelected = (claim: Claim): boolean => {
  const correctInterestOptionsNotSelected=  !(claim.interest?.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST && (claim.interest?.sameRateInterestSelection?.sameRateInterestType === undefined
    || claim.interest?.interestClaimFrom === undefined
    || claim.interest?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE && claim.interest?.interestStartDate?.date === undefined));
  if(correctInterestOptionsNotSelected) {
    logger.debug(`Interest is not calculated for claim ${claim?.id} as claim interest options are not selected correctly. Claim interest options: ${claim.interest?.interestClaimOptions}`);
  }
  return correctInterestOptionsNotSelected;
};
export const calculateInterestToDate = async (claim: Claim): Promise<number> => {
  if(!claim.hasInterest() || correctInterestSelected(claim) === false) {
    logger.debug(`Interest is not calculated for claim ${claim?.id} as claim has no interest or interest is not selected correctly`);
    return 0;
  }
  const caseDataInterest = translateDraftClaimToCCDInterest(claim);
  return await civilServiceClient.calculateClaimInterest(caseDataInterest);
};

export const getInterestData = async (claim: Claim, lang: string) => {
  const startDate = getInterestStartDate(claim);
  const endDate = getInterestEndDate(claim);
  const numberOfDays = Math.abs(getNumberOfDaysBetweenTwoDays(startDate, endDate));
  const interestStartDate = formatDateToFullDate(startDate, getLng(lang));
  const interestToDate = (await calculateInterestToDate(claim)).toFixed(2);
  const interestRate = getInterestRate(claim);
  const isBreakDownInterest = claim.isInterestClaimOptionsBreakDownInterest();
  const howInterestIsCalculatedReason = isBreakDownInterest ? claim.getHowTheInterestCalculatedReason() : undefined;
  const interestEndDate = formatDateToFullDate(endDate, getLng(lang));

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
