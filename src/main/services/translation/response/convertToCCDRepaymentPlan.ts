import {CCDRepaymentPlan, CCDRepaymentPlanFrequency} from '../../../common/models/ccdResponse/ccdRepaymentPlan';
import {RepaymentPlan} from '../../../common/models/repaymentPlan';

const toCCDRepaymentPlanFrequency = (frequency: string): CCDRepaymentPlanFrequency => {
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
      paymentAmount: repaymentPlan?.paymentAmount,
      repaymentFrequency: toCCDRepaymentPlanFrequency(repaymentPlan?.repaymentFrequency),
      firstRepaymentDate: repaymentPlan?.firstRepaymentDate,
    };
  }
};
