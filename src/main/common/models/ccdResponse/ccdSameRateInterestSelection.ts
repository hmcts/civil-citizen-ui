export interface CCDSameRateInterestSelection {
  sameRateInterestType:	CCDSameRateInterestType,
  differentRate:	number,
  differentRateReason:	string,
}

export enum CCDSameRateInterestType {
  SAME_RATE_INTEREST_8_PC = 'SAME_RATE_INTEREST_8_PC',
  SAME_RATE_INTEREST_DIFFERENT_RATE = 'SAME_RATE_INTEREST_DIFFERENT_RATE',
}
