const notEligibleReason = Object.freeze({
  CLAIM_VALUE_NOT_KNOWN: 'claim-value-not-known',
  CLAIM_VALUE_OVER_25000: 'claim-value-over-25000',
  MULTIPLE_DEFENDANTS: 'multiple-defendants',
  DEFENDANT_ADDRESS : 'defendant-address',
  MULTIPLE_CLAIMANTS: 'multiple-claimants',
  CLAIM_ON_BEHALF: 'claim-on-behalf',
  CLAIMANT_ADDRESS: 'claimant-address',
  CLAIM_IS_FOR_TENANCY_DEPOSIT: 'claim-is-for-tenancy-deposit',
  GOVERNMENT_DEPARTMENT: 'government-department',
  UNDER_18_DEFENDANT: 'under-18-defendant',
  UNDER_18: 'under-18',
});

const eligibleCheckBoxValue = Object.freeze({
  OVER_25000: 'totalAmount',
  LESS_OR_25000: 'totalAmount-2',
  I_DONT_KNOW_THE_AMOUNT: 'totalAmount-3',
});

const defendantAgeCheckBoxValue = Object.freeze({
  YES: 'defendant-age-eligibility',
  NO: 'defendant-age-eligibility-2',
  IM_CLAIMING_AGAINST_A_COMPANY_OR_ORGANISATION: 'defendant-age-eligibility-3',
});

const yesAndNoCheckBoxOptionValue = Object.freeze({
  YES: 'option',
  NO: 'option-2',
});

const claimTypeValue = Object.freeze({
  JUST_MY_SELF_OR_MY_ORGANISATION: 'claimType',
  MORE_THAN_ONE_PERSON_OR_ORGANISATION: 'claimType-2',
  A_CLIENT_IM_THEIR_SOLICITOR: 'claimType-3',
});

module.exports = {
  notEligibleReason,
  eligibleCheckBoxValue,
  yesAndNoCheckBoxOptionValue,
  claimTypeValue,
  defendantAgeCheckBoxValue,
};
