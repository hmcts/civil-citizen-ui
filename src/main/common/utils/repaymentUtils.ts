import {Claim} from 'common/models/claim';
import {addDaysToDate, addMonths} from './dateUtils';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {t} from 'i18next';

const WEEKDAYS = 7;
const frequencyTextMap: Record<TransactionSchedule, string> = {
  [TransactionSchedule.WEEK]: 'COMMON.SCHEDULE.WEEK_LOWER_CASE',
  [TransactionSchedule.TWO_WEEKS]: 'COMMON.SCHEDULE.TWO_WEEKS_LOWER_CASE',
  [TransactionSchedule.FOUR_WEEKS]: 'COMMON.SCHEDULE.MONTH',
  [TransactionSchedule.MONTH]: 'COMMON.SCHEDULE.MONTH',
};

export const getNumberOfInstalments = (claim: Claim): number => {
  return Math.ceil(getAmount(claim) / getPaymentAmount(claim));
};

export const getFinalPaymentDate = (claim: Claim): Date => {
  let finalRepaymentDate = new Date(Date.now());
  const numberOfInstalments = getNumberOfInstalments(claim);
  const firstRepaymentDate = getFirstRepaymentDate(claim);
  const repaymentFrequency = getRepaymentFrequency(claim);

  switch (repaymentFrequency) {
    case TransactionSchedule.WEEK:
      finalRepaymentDate = addDaysToDate(firstRepaymentDate, (numberOfInstalments * WEEKDAYS));
      break;
    case TransactionSchedule.TWO_WEEKS:
      finalRepaymentDate = addDaysToDate(firstRepaymentDate, ((numberOfInstalments * 2) * WEEKDAYS));
      break;
    case TransactionSchedule.MONTH:
      finalRepaymentDate = addMonths(firstRepaymentDate, numberOfInstalments);
      break;
  }
  return finalRepaymentDate;
};

export const getAmount = (claim: Claim): number => claim.partialAdmission?.howMuchDoYouOwe?.amount ? claim.partialAdmission.howMuchDoYouOwe.amount : claim.totalClaimAmount;

export const getPaymentAmount = (claim: Claim): number => {
  if (claim.isFullAdmission()) {
    return claim.fullAdmission?.paymentIntention?.repaymentPlan?.paymentAmount;
  }
  return claim.partialAdmission?.paymentIntention?.repaymentPlan?.paymentAmount;
};

export const getPaymentDate = (claim: Claim): Date => {
  if (claim.isFullAdmission()) {
    return claim.fullAdmission?.paymentIntention?.paymentDate;
  }
  return claim.partialAdmission?.paymentIntention?.paymentDate;
};

export const getRepaymentFrequency = (claim: Claim): string => {
  if (claim.isFullAdmission()) {
    return claim.fullAdmission?.paymentIntention?.repaymentPlan?.repaymentFrequency;
  }
  return claim.partialAdmission?.paymentIntention?.repaymentPlan?.repaymentFrequency;
};

export const getFirstRepaymentDate = (claim: Claim): Date => {
  if (claim.isFullAdmission()) {
    return new Date(claim.fullAdmission?.paymentIntention?.repaymentPlan?.firstRepaymentDate);
  }
  return new Date(claim.partialAdmission?.paymentIntention?.repaymentPlan?.firstRepaymentDate);
};

export const convertFrequencyToText = (frequency: string, lng: string): string => {
  switch (frequency as TransactionSchedule) {
    case TransactionSchedule.WEEK:
      return t('COMMON.FREQUENCY_OF_PAYMENTS.WEEKLY', { lng });
    case TransactionSchedule.TWO_WEEKS:
      return t('COMMON.FREQUENCY_OF_PAYMENTS.TWO_WEEKS', { lng });
    case TransactionSchedule.MONTH:
      return t('COMMON.FREQUENCY_OF_PAYMENTS.MONTHLY', { lng });
  }
};

export const convertFrequencyToTextForRepaymentPlan = (frequency: string, lng: string): string => {
  const transactionKey = frequency as TransactionSchedule;
  return t(frequencyTextMap[transactionKey], { lng });
};

export const getRepaymentLength = (claim: Claim, lng: string): string => {
  const repaymentFrequency = getRepaymentFrequency(claim);
  let repaymentLength = '';
  switch (repaymentFrequency) {
    case TransactionSchedule.WEEK:
      repaymentLength = getNumberOfInstalments(claim) === 2 ? t('COMMON.SCHEDULE.TWO_WEEKS', { lng }) : getNumberOfInstalments(claim) + ' ' + t('COMMON.SCHEDULE.WEEKS_LOWER_CASE', { lng });
      break;
    case TransactionSchedule.TWO_WEEKS:
      repaymentLength = getNumberOfInstalments(claim) * 2 +  ' ' + t('COMMON.SCHEDULE.WEEKS_LOWER_CASE', {lng});
      break;
    case TransactionSchedule.MONTH:
      repaymentLength = getNumberOfInstalments(claim) + ' ' + t('COMMON.SCHEDULE.MONTHS_LOWER_CASE', { lng });
      break;
  }

  return repaymentLength;
};
