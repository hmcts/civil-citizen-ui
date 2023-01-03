import {Claim} from 'common/models/claim';
import {addDaysToDate, addMonths} from './dateUtils';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {t} from 'i18next';

const WEEKDAYS = 7;
let paymentAmount = 0;
let repaymentFrequency = '';
let firstRepaymentDate = new Date(Date.now());

export const isRepaymentPlanFullOrPartAdmit = (claim: Claim) => {
  if (claim.isFullAdmission()) {
    const repaymentPlan = claim.fullAdmission.paymentIntention.repaymentPlan;
    paymentAmount = repaymentPlan?.paymentAmount;
    repaymentFrequency = repaymentPlan?.repaymentFrequency;
    firstRepaymentDate = new Date(repaymentPlan?.firstRepaymentDate);
  } else if (claim.isPartialAdmission()) {
    const repaymentPlan = claim.partialAdmission.paymentIntention.repaymentPlan;
    paymentAmount = repaymentPlan?.paymentAmount;
    repaymentFrequency = repaymentPlan?.repaymentFrequency;
    firstRepaymentDate = new Date(repaymentPlan?.firstRepaymentDate);
  }
};

export const getNumberOfInstalments = (claim: Claim) => {
  isRepaymentPlanFullOrPartAdmit(claim);
  return Math.ceil(getAmount(claim) / paymentAmount);
};

export const getFinalPaymentDate = (claim: Claim) => {
  isRepaymentPlanFullOrPartAdmit(claim);
  const numberOfInstalments = getNumberOfInstalments(claim);
  let finalRepaymentDate = new Date(Date.now());

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

export const getAmount = (claim: Claim) => claim.partialAdmission?.howMuchDoYouOwe?.amount ? claim.partialAdmission.howMuchDoYouOwe.amount : claim.totalClaimAmount;

export const getPaymentAmount = (claim: Claim) => {
  isRepaymentPlanFullOrPartAdmit(claim);
  return paymentAmount;
};

export const getRepaymentFrequency = (claim: Claim) => {
  isRepaymentPlanFullOrPartAdmit(claim);
  return repaymentFrequency;
};

export const getFirstRepaymentDate = (claim: Claim) => {
  isRepaymentPlanFullOrPartAdmit(claim);
  return firstRepaymentDate;
};

export const convertFrequencyToText = (frequency: string, lng: string) => {
  switch (frequency as TransactionSchedule) {
    case TransactionSchedule.WEEK:
      return t('COMMON.FREQUENCY_OF_PAYMENTS.WEEKLY', {lng});
    case TransactionSchedule.TWO_WEEKS:
      return t('COMMON.FREQUENCY_OF_PAYMENTS.TWO_WEEKS', {lng});
    case TransactionSchedule.MONTH:
      return t('COMMON.FREQUENCY_OF_PAYMENTS.MONTHLY', {lng});
  }
};
