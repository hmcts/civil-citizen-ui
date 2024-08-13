const responseType = Object.freeze({
  I_ADMIT_ALL_OF_THE_CLAIM: 'responseType',
  I_ADMIT_PART_OF_THE_CLAIM: 'responseType-2',
  I_REJECT_ALL_OF_THE_CLAIM: 'responseType-3',
});

const paymentType = Object.freeze({
  IMMEDIATELY: 'paymentType',
  BY_A_SET_DATE: 'paymentType-2',
  I_WILL_SUGGEST_A_REPAYMENT_PLAN: 'paymentType-3',
});

const rejectOfClaimType = Object.freeze({
  I_HAVE_PAID_WHAT_I_BELIEVE_I_OWE: 'option',
  I_DISPUTE_ALL_OF_THE_CLAIM: 'option-2',
  I_DISPUTE_THE_CLAIM_AND_WANT_TO_MAKE_A_COUNTERCLAIM: 'option-3',
});

module.exports = {
  responseType,
  paymentType,
  rejectOfClaimType,
};
