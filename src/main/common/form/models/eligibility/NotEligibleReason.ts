export enum NotEligibleReason {
  CLAIM_ON_BEHALF = 'claim-on-behalf',
  CLAIM_VALUE_NOT_KNOWN = 'claim-value-not-known',
  CLAIM_VALUE_OVER_25000 = 'claim-value-over-25000',
  UNDER_18_DEFENDANT = 'under-18-defendant',
  UNDER_18_CLAIMANT = 'under-18',
  MULTIPLE_CLAIMANTS = 'multiple-claimants',
  MULTIPLE_DEFENDANTS = 'multiple-defendants',
  HELP_WITH_FEES = 'help-with-fees',
  HELP_WITH_FEES_REFERENCE = 'help-with-fees-reference',
  CLAIMANT_ADDRESS = 'claimant-address',
  DEFENDANT_ADDRESS = 'defendant-address',
  GOVERNMENT_DEPARTMENT = 'government-department',
  CLAIM_IS_FOR_TENANCY_DEPOSIT = 'claim-is-for-tenancy-deposit',
}
