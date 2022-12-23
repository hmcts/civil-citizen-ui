import {Claim} from 'common/models/claim';
import {addDaysToDate, addMonths, formatDateToFullDate} from './dateUtils';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

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

const getNumberOfInstalments = (claim: Claim) => Math.ceil(getAmount(claim) / paymentAmount);

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

  return formatDateToFullDate(finalRepaymentDate);

};

export const getAmount = (claim: Claim) => claim.partialAdmission?.howMuchDoYouOwe?.amount ? claim.partialAdmission.howMuchDoYouOwe.amount : claim.totalClaimAmount;
export const getPaymentAmount = () => paymentAmount;
export const getRepaymentFrequency = () => repaymentFrequency;
export const getFirstRepaymentDate = (claim: Claim) => {
  isRepaymentPlanFullOrPartAdmit(claim);
  return formatDateToFullDate(firstRepaymentDate);
};
