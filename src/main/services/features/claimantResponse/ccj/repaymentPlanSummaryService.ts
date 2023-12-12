import {RepaymentPlanSummary} from 'form/models/admission/repaymentPlanSummary';
import {
  convertFrequencyToText,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount, getRepaymentFrequency, getRepaymentLength
} from 'common/utils/repaymentUtils';
import {getLng} from 'common/utils/languageToggleUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';

export const getRepaymentPlan = (claim: Claim, lang: string): RepaymentPlanSummary => {
  const frequency = getRepaymentFrequency(claim);
  const repaymentPlan: RepaymentPlanSummary = {
    paymentAmount: getPaymentAmount(claim),
    repaymentFrequency: convertFrequencyToText(frequency, getLng(lang)),
    firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim)),
    finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim)),
    lengthOfRepaymentPlan: getRepaymentLength(claim, getLng(lang)),
  };
  return repaymentPlan;
};
