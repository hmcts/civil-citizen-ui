import {Claim} from 'common/models/claim';
import {addDaysToDate, addMonths} from './dateUtils';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {t} from 'i18next';

const WEEKDAYS = 7;

export const getNumberOfInstalments = (claim: Claim) => {
  return Math.ceil(getAmount(claim) / getPaymentAmount(claim));
};

export const getFinalPaymentDate = (claim: Claim) => {
  const numberOfInstalments = getNumberOfInstalments(claim);
  let finalRepaymentDate = new Date(Date.now());
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

export const getAmount = (claim: Claim) => claim.partialAdmission?.howMuchDoYouOwe?.amount ? claim.partialAdmission.howMuchDoYouOwe.amount : claim.totalClaimAmount;

export const getPaymentAmount = (claim: Claim) => {
  if (claim.isFullAdmission()) {
    return claim.fullAdmission.paymentIntention.repaymentPlan.paymentAmount;
  }
  return claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount;
};

export const getRepaymentFrequency = (claim: Claim) => {
  if (claim.isFullAdmission()) {
    return claim.fullAdmission.paymentIntention.repaymentPlan.repaymentFrequency;
  }
  return claim.partialAdmission.paymentIntention.repaymentPlan.repaymentFrequency;
};

export const getFirstRepaymentDate = (claim: Claim) => {
  if (claim.isFullAdmission()) {
    return new Date(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate);
  }
  return new Date(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate);
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
