import {RepaymentPlan} from '../repaymentPlan';

export interface CCDRepaymentPlan {
  paymentAmount?: number;
  repaymentFrequency?: CCDRepaymentPlanFrequency;
  firstRepaymentDate?: Date;
}

export enum CCDRepaymentPlanFrequency {
  ONCE_ONE_WEEK = 'ONCE_ONE_WEEK',
  ONCE_TWO_WEEKS = 'ONCE_TWO_WEEKS',
  ONCE_FOUR_WEEKS = 'ONCE_FOUR_WEEKS',
  ONCE_ONE_MONTH = 'ONCE_ONE_MONTH',
}

const toCCDRepaymentPlanFrequency = (frequency: string): CCDRepaymentPlanFrequency => {
  switch (frequency) {
    case 'WEEK':
      return CCDRepaymentPlanFrequency.ONCE_ONE_WEEK;
    case 'TWO_WEEKS':
      return CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS;
    case 'FOUR_WEEKS':
      return CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS;
    default:
      return CCDRepaymentPlanFrequency.ONCE_ONE_MONTH;
  }
};

export const toCCDRepaymentPlan = (repaymentPlan: RepaymentPlan): CCDRepaymentPlan => {
  return {
    paymentAmount: repaymentPlan?.paymentAmount,
    repaymentFrequency: toCCDRepaymentPlanFrequency(repaymentPlan?.repaymentFrequency),
    firstRepaymentDate: repaymentPlan?.firstRepaymentDate,
  };
};

