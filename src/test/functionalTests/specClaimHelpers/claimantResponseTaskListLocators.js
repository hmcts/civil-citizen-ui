// Shared with rendered-template regressions so functional navigation is checked
// against the GOV.UK task-list markup used by the application.
// Normalise component indentation while retaining exact task-title matching.
module.exports = {
  view_defendants_response: '//a[normalize-space(.)="View the defendant\'s response"]',
  accept_or_reject: '//a[normalize-space(.)=\'Accept or reject the £500.00\']',
  accept_or_reject_their_response: '//a[normalize-space(.)=\'Accept or reject their response\']',
  accept_or_reject_the_payment_plan: '//a[contains(.,\'Accept or reject their repayment plan\')]',
  accept_or_reject_the_plan: '//a[contains(.,\'Accept or reject\')]',
  propose_an_alternative_repayment_plan: '//a[contains(.,\'Propose an alternative repayment plan\')]',
  how_to_formalise_repayment: '//a[normalize-space(.)=\'Choose how to formalise repayment\']',
  sign_a_settlements_agreement: '//a[normalize-space(.)=\'Sign a settlement agreement\']',
  request_a_CCJ: '//a[normalize-space(.)=\'Request a County Court Judgment\']',
  check_and_submit_your_response: '//a[normalize-space(.)=\'Check and submit your response\']',
  decide_whether_to_proceed: '//a[normalize-space(.)=\'Decide whether to proceed\']',
  free_mediation: '//a[normalize-space(.)=\'Free telephone mediation\']',
  details_in_case_of_a_hearing: '//a[normalize-space(.)="Give us details in case there\'s a hearing"]',
  have_you_been_paid: '//a[contains(text(), \'Have you been paid the\')]',
  settle_the_claim_for: '//a[contains(text(), \'Settle the claim for\')]',
  propose_alternative_plan: '//a[contains(text(), \'Propose an alternative repayment plan\')]',
};
