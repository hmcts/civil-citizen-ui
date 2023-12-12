import {RepaymentPlanSummary} from 'form/models/admission/repaymentPlanSummary';
import {
  convertFrequencyToText,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount, getPaymentDate, getRepaymentFrequency, getRepaymentLength,
} from 'common/utils/repaymentUtils';
import {getLng} from 'common/utils/languageToggleUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {RepaymentInformation} from 'form/models/admission/repaymentInformation';


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

export const getRepaymentInfo=(  claim:Claim,lang:string):RepaymentInformation=>{
  const paymentIntention= claim.getPaymentIntention();
  const repaymentPlanInfo: RepaymentInformation = {
    paymentIntention: paymentIntention,
    paymentOption: paymentIntention.paymentOption,
    paymentDate: formatDateToFullDate(getPaymentDate(claim)),
    repaymentPlan: getRepaymentPlan(claim, lang)
  };
  return repaymentPlanInfo;

}


