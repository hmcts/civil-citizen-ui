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
  repaymentPlanLRspec: CCDClaimantRepaymentPlan;
  proposedRepaymentType: CCDPaymentOption;
  repaymentByDate: string;
}

export interface CCDClaimantRepaymentPlan {
  paymentAmount?: number;
  repaymentFrequency?: CCDRepaymentPlanFrequency;
  firstRepaymentDate?: string;
}

export const toCCDClaimantRepaymentPlan = (repaymentPlan: RepaymentPlan): CCDClaimantRepaymentPlan => {
  if (repaymentPlan) {
    return {
      paymentAmount: convertToPence(repaymentPlan?.paymentAmount),
      repaymentFrequency: toCCDRepaymentPlanFrequency(repaymentPlan?.repaymentFrequency),
      firstRepaymentDate: DateTime.fromJSDate(new Date((repaymentPlan?.firstRepaymentDate))).toFormat('yyyy-MM-dd'),
    };
  }
};

function toCCDRepaymentDate(suggestedPaymentIntention: PaymentIntention) {
  if (suggestedPaymentIntention?.paymentOption == PaymentOptionType.BY_SET_DATE) {
    return DateTime.fromJSDate(new Date((suggestedPaymentIntention?.paymentDate as unknown as PaymentDate).date)).toFormat('yyyy-MM-dd');
  }
  return undefined;
}

export const toCCDClaimantProposedPlan = (suggestedPaymentIntention: PaymentIntention) : CCDClaimantProposedPlan => {
  return {
    repaymentPlanLRspec: toCCDClaimantRepaymentPlan(suggestedPaymentIntention?.repaymentPlan),
    proposedRepaymentType: toCCDPaymentOption(suggestedPaymentIntention?.paymentOption),
    repaymentByDate: toCCDRepaymentDate(suggestedPaymentIntention),
  };
};
