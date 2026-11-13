import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';
import {RepaymentPlan} from 'models/repaymentPlan';
import {convertToPence} from 'services/translation/claim/moneyConversation';
import {DateTime} from 'luxon';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {toCCDPaymentOption} from 'services/translation/response/convertToCCDPaymentOption';
import {toCCDRepaymentPlanFrequency} from 'services/translation/response/convertToCCDRepaymentPlan';

export interface CCDClaimantProposedPlan {
  repaymentPlanLRspec?: CCDClaimantRepaymentPlan;
  proposedRepaymentType?: CCDPaymentOption;
  repaymentByDate?: string;
}

export interface CCDClaimantRepaymentPlan {
  paymentAmount?: number;
  repaymentFrequency?: CCDRepaymentPlanFrequency;
  firstRepaymentDate?: string;
}

export const toCCDClaimantRepaymentPlan = (repaymentPlan: RepaymentPlan | undefined): CCDClaimantRepaymentPlan | undefined => {
  if (repaymentPlan) {
    return {
      paymentAmount: repaymentPlan.paymentAmount ? convertToPence(repaymentPlan.paymentAmount) : undefined,
      repaymentFrequency: repaymentPlan.repaymentFrequency ? toCCDRepaymentPlanFrequency(repaymentPlan.repaymentFrequency) : undefined,
      firstRepaymentDate: repaymentPlan.firstRepaymentDate ? DateTime.fromJSDate(new Date(repaymentPlan.firstRepaymentDate)).toFormat('yyyy-MM-dd') : undefined,
    };
  }
  return undefined;
};

function toCCDRepaymentDate(suggestedPaymentIntention: PaymentIntention) {
  if (suggestedPaymentIntention?.paymentOption == PaymentOptionType.BY_SET_DATE) {
    const paymentDate = (suggestedPaymentIntention.paymentDate as unknown as PaymentDate).date;
    return paymentDate ? DateTime.fromJSDate(new Date(paymentDate)).toFormat('yyyy-MM-dd') : undefined;
  }
  return undefined;
}

export const toCCDClaimantProposedPlan = (suggestedPaymentIntention: PaymentIntention) : CCDClaimantProposedPlan => {
  return {
    repaymentPlanLRspec: toCCDClaimantRepaymentPlan(suggestedPaymentIntention?.repaymentPlan),
    proposedRepaymentType: suggestedPaymentIntention?.paymentOption ? toCCDPaymentOption(suggestedPaymentIntention.paymentOption) : undefined,
    repaymentByDate: toCCDRepaymentDate(suggestedPaymentIntention),
  };
};
