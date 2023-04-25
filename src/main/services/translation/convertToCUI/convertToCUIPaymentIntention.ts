import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDClaim} from "models/civilClaimResponse";
import {CCDRepaymentPlanFrequency} from "models/ccdResponse/ccdRepaymentPlan";
import {TransactionSchedule} from "form/models/statementOfMeans/expensesAndIncome/transactionSchedule";

export const toCUIPaymentIntention = (ccdClaim: CCDClaim): PaymentIntention => {
  const pi: PaymentIntention = new PaymentIntention();
  switch (ccdClaim?.defenceAdmitPartPaymentTimeRouteRequired) {
    case CCDPaymentOption.BY_SET_DATE:
      pi.paymentOption = PaymentOptionType.BY_SET_DATE;
      pi.paymentDate = new Date(ccdClaim?.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid);
      break;
    case CCDPaymentOption.IMMEDIATELY:
      pi.paymentOption = PaymentOptionType?.IMMEDIATELY;
      break;
    case CCDPaymentOption.REPAYMENT_PLAN:
      pi.paymentOption = PaymentOptionType?.INSTALMENTS;
      pi.repaymentPlan.firstRepaymentDate = new Date(ccdClaim?.respondent1RepaymentPlan?.firstRepaymentDate);
      switch (ccdClaim?.respondent1RepaymentPlan?.repaymentFrequency) {
        case CCDRepaymentPlanFrequency.ONCE_ONE_WEEK:
          pi.repaymentPlan.repaymentFrequency = TransactionSchedule.WEEK;
          break;
        case CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS:
          pi.repaymentPlan.repaymentFrequency = TransactionSchedule.TWO_WEEKS;
          break;
        case CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS:
          pi.repaymentPlan.repaymentFrequency = TransactionSchedule.FOUR_WEEKS;
          break;
        case CCDRepaymentPlanFrequency.ONCE_ONE_MONTH:
          pi.repaymentPlan.repaymentFrequency = TransactionSchedule.MONTH;
          break;
        default:
          pi.repaymentPlan.repaymentFrequency = undefined;
      }
      pi.repaymentPlan.paymentAmount = ccdClaim?.respondent1RepaymentPlan?.paymentAmount;
      break;
    default:
      pi.paymentOption = undefined;
  }
  return pi;
}
