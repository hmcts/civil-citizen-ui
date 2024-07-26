const notEligibleReason = Object.freeze({
  CLAIM_VALUE_NOT_KNOWN: 'claim-value-not-known',
  CLAIM_VALUE_OVER_25000: 'claim-value-over-25000',
  MULTIPLE_DEFENDANTS: 'multiple-defendants',
});

const eligibleCheckBoxValue = Object.freeze({
  OVER_25000: 'totalAmount',
  LESS_OR_25000: 'totalAmount-2',
  I_DONT_KNOW_THE_AMOUNT: 'totalAmount-3',
});

const yesAndNoCheckBoxOptionValue = Object.freeze({
  YES: 'option',
  NO: 'option-2',
});

module.exports = {
  notEligibleReason,
  eligibleCheckBoxValue,
  yesAndNoCheckBoxOptionValue,
};
