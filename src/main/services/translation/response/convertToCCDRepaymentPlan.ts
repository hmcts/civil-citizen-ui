import {
  CCDRepaymentPlan,
  CCDRepaymentPlanFrequency,
} from 'models/ccdResponse/ccdRepaymentPlan';
import {RepaymentPlan} from 'models/repaymentPlan';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const toCCDRepaymentPlanFrequency = (frequency: string): CCDRepaymentPlanFrequency => {
  switch (frequency) {
    case 'WEEK':
      return CCDRepaymentPlanFrequency.ONCE_ONE_WEEK;
    case 'TWO_WEEKS':
      return CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS;
    case 'FOUR_WEEKS':
      return CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS;
    case 'MONTH':
      return CCDRepaymentPlanFrequency.ONCE_ONE_MONTH;
    default:
      return undefined;
  }
};

export const toCCDRepaymentPlan = (repaymentPlan: RepaymentPlan): CCDRepaymentPlan => {
  if (repaymentPlan) {
    return {
      paymentAmount: convertToPence(repaymentPlan?.paymentAmount),
      repaymentFrequency: toCCDRepaymentPlanFrequency(repaymentPlan?.repaymentFrequency),
      firstRepaymentDate: repaymentPlan?.firstRepaymentDate,
    };
  }
};

