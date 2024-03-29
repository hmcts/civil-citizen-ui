export enum ClaimResponseStatus {
  FA_PAY_IMMEDIATELY = 'FULL_ADMISSION_PAY_IMMEDIATELY',
  FA_PAY_INSTALLMENTS = 'FULL_ADMISSION_PAY_INSTALLMENTS',
  FA_PAY_BY_DATE = 'FULL_ADMISSION_PAY_BY_DATE',
  PA_ALREADY_PAID = 'PART_ADMISSION_ALREADY_PAID',
  PA_ALREADY_PAID_ACCEPTED_SETTLED = 'PA_ALREADY_PAID_ACCEPTED_SETTLED',
  PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED = 'PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED',
  PA_ALREADY_PAID_NOT_ACCEPTED = 'PA_ALREADY_PAID_NOT_ACCEPTED',
  PA_NOT_PAID_PAY_IMMEDIATELY = 'PART_ADMISSION_NOT_PAID_PAY_IMMEDIATELY',
  PA_NOT_PAID_NOT_ACCEPTED = 'PART_ADMISSION_NOT_PAID_NOT_ACCEPTED',
  PA_NOT_PAID_PAY_INSTALLMENTS = 'PART_ADMISSION_NOT_PAID_PAY_INSTALLMENTS',
  PA_NOT_PAID_PAY_BY_DATE = 'PART_ADMISSION_NOT_PAID_PAY_BY_DATE',
  RC_PAID_FULL = 'REJECT_CLAIM_PAID_FULL_CLAIM',
  RC_PAID_LESS = 'REJECT_CLAIM_PAID_LESS_CLAIM',
  RC_DISPUTE = 'REJECT_CLAIM_DISPUTE',
  PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED = 'PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED',
  PA_FA_CLAIMANT_REJECT_REPAYMENT_PLAN = 'PART_FULL_ADMISSION_CLAIMANT_REJECT_REPAYMENT_PLAN',
  RC_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED = 'REJECT_CLAIM_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED',
}
