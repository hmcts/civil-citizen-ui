import {NotEligibleReason} from '../../common/form/models/eligibility/NotEligibleReason';

export const convertToNotEligibleReason = (reason: string): NotEligibleReason => {
  switch (reason) {
    case 'claim-on-behalf':
      return NotEligibleReason.CLAIM_ON_BEHALF;
    case 'claim-value-not-known':
      return NotEligibleReason.CLAIM_VALUE_NOT_KNOWN;
    case 'claim-value-over-25000':
      return NotEligibleReason.CLAIM_VALUE_OVER_25000;
    case 'under-18':
      return NotEligibleReason.UNDER_18;
    case 'under-18-defendant':
      return NotEligibleReason.UNDER_18_DEFENDANT;
    case 'multiple-claimants':
      return NotEligibleReason.MULTIPLE_DEFENDANTS;
    case 'multiple-defendants':
      return NotEligibleReason.MULTIPLE_DEFENDANTS;
    case 'help-with-fees':
      return NotEligibleReason.HELP_WITH_FEES;
    case 'help-with-fees-reference':
      return NotEligibleReason.HELP_WITH_FEES_REFERENCE;
    case 'claimant-address':
      return NotEligibleReason.CLAIMANT_ADDRESS;
    case 'defendant-address':
      return NotEligibleReason.DEFENDANT_ADDRESS;
    case 'government-department':
      return NotEligibleReason.GOVERNMENT_DEPARTMENT;
    case 'claim-is-for-tenancy-deposit':
      return NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT;
    default:
      return undefined;
  }
};

