export interface CCDHelpWithFeesDetails {
  remissionAmount?: string;
  outstandingFeeInPounds?: string;
  noRemissionDetails?: string;
  noRemissionDetailsSummary?: CCDNoRemissionDetailsSummary;
}

export enum CCDNoRemissionDetailsSummary {
  NOT_QUALIFY_FEE_ASSISTANCE = 'NOT_QUALIFY_FEE_ASSISTANCE',
  INCORRECT_EVIDENCE = 'INCORRECT_EVIDENCE',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
  FEES_REQUIREMENT_NOT_MET = 'FEES_REQUIREMENT_NOT_MET',
}
