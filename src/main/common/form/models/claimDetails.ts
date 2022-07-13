export enum InterestClaimFromType {
  FROM_CLAIM_SUBMIT_DATE = 'FROM_CLAIM_SUBMIT_DATE',
  FROM_A_SPECIFIC_DATE = 'FROM_A_SPECIFIC_DATE'
}

export enum InterestClaimUntilType {
  UNTIL_CLAIM_SUBMIT_DATE = 'UNTIL_CLAIM_SUBMIT_DATE',
  UNTIL_SETTLED_OR_JUDGEMENT_MADE = 'UNTIL_SETTLED_OR_JUDGEMENT_MADE'
}

export enum InterestClaimOptions {
  SAME_RATE_INTEREST = 'SAME_RATE_INTEREST',
  BREAK_DOWN_INTEREST = 'BREAK_DOWN_INTEREST'
}

export enum SameRateInterestType {
  SAME_RATE_INTEREST_8_PC = 'SAME_RATE_INTEREST_8_PC',
  SAME_RATE_INTEREST_DIFFERENT_RATE = 'SAME_RATE_INTEREST_DIFFERENT_RATE'
}
export interface SameRateInterestSelection {
  sameRateInterestType: SameRateInterestType,
  differentRate?: number
}

export interface ClaimFee {
  calculatedAmountInPence: string;
}

export interface ClaimAmountBreakup {
  value: ClaimAmountBreakupDetails,
}

export interface ClaimAmountBreakupDetails {
  claimAmount: string,
  claimReason: string,
}

export enum CaseState {
  PENDING_CASE_ISSUED = 'PENDING_CASE_ISSUED',
  CASE_ISSUED = 'CASE_ISSUED',
  AWAITING_CASE_DETAILS_NOTIFICATION = 'AWAITING_CASE_DETAILS_NOTIFICATION',
  AWAITING_RESPONDENT_ACKNOWLEDGEMENT = 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT',
  CASE_DISMISSED = 'CASE_DISMISSED',
  AWAITING_APPLICANT_INTENTION ='AWAITING_APPLICANT_INTENTION',
  PROCEEDS_IN_HERITAGE_SYSTEM ='PROCEEDS_IN_HERITAGE_SYSTEM'
}
