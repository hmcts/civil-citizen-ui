import {Claim} from 'common/models/claim';
import {addDaysToDate, addMonths, formatDateToFullDate} from './dateUtils';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {ResponseType} from 'common/form/models/responseType';

let lengthOfRepayment = 0;
let paymentAmount = 0;
let repaymentFrequency = '';
let firstRepaymentDate = new Date(Date.now());

export const isFullOrPartAdmit = (claim: Claim) => {
  if (claim.respondent1.responseType === ResponseType.FULL_ADMISSION) {
    const repaymentPlan = claim.fullAdmission?.paymentIntention?.repaymentPlan;
    paymentAmount = repaymentPlan?.paymentAmount;
    repaymentFrequency = repaymentPlan?.repaymentFrequency;
    firstRepaymentDate = new Date(repaymentPlan?.firstRepaymentDate);
  } else if (claim.respondent1.responseType === ResponseType.PART_ADMISSION) {
    const repaymentPlan = claim.partialAdmission?.paymentIntention?.repaymentPlan;
    paymentAmount = repaymentPlan?.paymentAmount;
    repaymentFrequency = repaymentPlan?.repaymentFrequency;
    firstRepaymentDate = new Date(repaymentPlan?.firstRepaymentDate);
  }
};

const getNumberOfInstalments = (claim: Claim) => Math.ceil(getAmount(claim) / paymentAmount);

export const getFinalPaymentDate = (claim: Claim) => {
  const numberOfInstalments = getNumberOfInstalments(claim);
  let finalRepaymentDate = new Date(Date.now());

  switch (repaymentFrequency) {
    case TransactionSchedule.WEEK:
      lengthOfRepayment = numberOfInstalments;
      finalRepaymentDate = addDaysToDate(firstRepaymentDate, (lengthOfRepayment * 7));
      break;
    case TransactionSchedule.TWO_WEEKS:
      lengthOfRepayment = numberOfInstalments * 2;
      finalRepaymentDate = addDaysToDate(firstRepaymentDate, (lengthOfRepayment * 14));
      break;
    case TransactionSchedule.MONTH:
      lengthOfRepayment = numberOfInstalments;
      finalRepaymentDate = addMonths(firstRepaymentDate, numberOfInstalments);
      break;
  }

  return formatDateToFullDate(finalRepaymentDate);

};

export const getAmount = (claim: Claim) => claim.partialAdmission?.howMuchDoYouOwe?.amount ? claim.partialAdmission.howMuchDoYouOwe.amount : claim.totalClaimAmount;
export const getPaymentAmount = () => paymentAmount;
export const getRepaymentFrequency = () => repaymentFrequency;
export const getLengthOfRepayment = () => lengthOfRepayment;
export const getFirstRepaymentDate = () => formatDateToFullDate(firstRepaymentDate);

