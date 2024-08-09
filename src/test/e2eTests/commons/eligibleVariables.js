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

const supportRequired = Object.freeze({
  YES: 'model\\[option\\]',
  NO: 'model\\[option\\]-2',
});

const claimTypeValue = Object.freeze({
  JUST_MY_SELF_OR_MY_ORGANISATION: 'claimType',
  MORE_THAN_ONE_PERSON_OR_ORGANISATION: 'claimType-2',
  A_CLIENT_IM_THEIR_SOLICITOR: 'claimType-3',
});

const claimantPartyType = Object.freeze({
  AN_INDIVIDUAL: 'claimantPartyType',
  A_SOLE_TRADER_OR_SELF_EMPLOYED_PERSON : 'claimantPartyType-2',
  A_LIMITED_COMPANY: 'claimantPartyType-3',
  ANOTHER_TYPE_OF_ORGANISATION: 'claimantPartyType-4',
});

const defendantPartyType = Object.freeze({
  AN_INDIVIDUAL: 'defendantPartyType',
  A_SOLE_TRADER_OR_SELF_EMPLOYED_PERSON : 'defendantPartyType-2',
  A_LIMITED_COMPANY: 'defendantPartyType-3',
  ANOTHER_TYPE_OF_ORGANISATION: 'defendantPartyType-4',
});

const interestType = Object.freeze({
  SAME_RATE_FOR_THE_WHOLE_PERIOD: 'interestType',
  BREAK_DOWN_INTEREST_FOR_DIFFERENT_TIME_PERIODS_OR_ITEMS : 'interestType-2',
});

const sameRateInterestType = Object.freeze({
  EIGHT_PERCENT: 'sameRateInterestType',
  A_DIFFERENT_RATE : 'sameRateInterestType-2',
});

const interestClaimFrom = Object.freeze({
  THE_DATE_YOU_SUBMIT_THE_CLAIM: 'interestClaimFrom',
  A_PARTICULAR_DATE : 'interestClaimFrom-2',
});

const speakLanguage = Object.freeze({
  ENGLISH: 'speakLanguage',
  WELSH : 'speakLanguage-2',
  WELSH_AND_ENGLISH: 'speakLanguage-3',
});

const documentLanguage = Object.freeze({
  ENGLISH: 'documentsLanguage',
  WELSH : 'documentsLanguage-2',
  WELSH_AND_ENGLISH: 'documentsLanguage-3',
});

module.exports = {
  notEligibleReason,
  eligibleCheckBoxValue,
  yesAndNoCheckBoxOptionValue,
  claimTypeValue,
  defendantAgeCheckBoxValue,
  claimantPartyType,
  defendantPartyType,
  interestType,
  sameRateInterestType,
  interestClaimFrom,
  speakLanguage,
  documentLanguage,
  supportRequired,
};
