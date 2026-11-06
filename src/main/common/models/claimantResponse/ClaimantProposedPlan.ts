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

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantProposedPlan');

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

const formatCCDDate = (date: Date): string => DateTime.fromJSDate(new Date(date)).toFormat('yyyy-MM-dd');

export const toCCDClaimantRepaymentPlan = (repaymentPlan?: RepaymentPlan): CCDClaimantRepaymentPlan | undefined => {
  if (repaymentPlan) {
    let firstRepaymentDate: string | undefined;
    if (repaymentPlan.firstRepaymentDate) {
      firstRepaymentDate = formatCCDDate(repaymentPlan.firstRepaymentDate);
    } else {
      logger.warn('[toCCDClaimantRepaymentPlan] repaymentPlan.firstRepaymentDate missing, returning undefined');
    }
    return {
      paymentAmount: convertToPence(repaymentPlan.paymentAmount),
      repaymentFrequency: toCCDRepaymentPlanFrequency(repaymentPlan.repaymentFrequency),
      firstRepaymentDate,
    };
  }
  return undefined;
};

function toCCDRepaymentDate(suggestedPaymentIntention?: PaymentIntention): string | undefined {
  if (suggestedPaymentIntention?.paymentOption == PaymentOptionType.BY_SET_DATE) {
    const paymentDate = (suggestedPaymentIntention.paymentDate as unknown as PaymentDate).date;
    if (!paymentDate) {
      logger.warn('[toCCDRepaymentDate] suggestedPaymentIntention.paymentDate.date missing, returning undefined');
      return undefined;
    }
    return formatCCDDate(paymentDate);
  }
  return undefined;
}

export const toCCDClaimantProposedPlan = (suggestedPaymentIntention?: PaymentIntention) : CCDClaimantProposedPlan => {
  return {
    repaymentPlanLRspec: toCCDClaimantRepaymentPlan(suggestedPaymentIntention?.repaymentPlan),
    proposedRepaymentType: toCCDPaymentOption(suggestedPaymentIntention?.paymentOption),
    repaymentByDate: toCCDRepaymentDate(suggestedPaymentIntention),
  };
};
