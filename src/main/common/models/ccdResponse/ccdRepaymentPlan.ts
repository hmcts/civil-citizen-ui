
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
