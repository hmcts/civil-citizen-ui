export interface CCDSameRateInterestSelection {
  sameRateInterestType:	CCDRepaymentPlanFrequency,
  differentRate:	number,
  differentRateReason:	string,
}

export enum CCDRepaymentPlanFrequency {
  SAME_RATE_INTEREST_8_PC = 'SAME_RATE_INTEREST_8_PC',
  SAME_RATE_INTEREST_DIFFERENT_RATE = 'SAME_RATE_INTEREST_DIFFERENT_RATE',
}
