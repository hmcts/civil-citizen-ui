// Shared with rendered-template regressions so functional navigation is checked
// against the GOV.UK task-list markup used by the application.
// Normalise component indentation while retaining exact task-title matching.
module.exports = {
  resolving_this_dispute: '//a[normalize-space(.)=\'Resolving this dispute\']',
  confirming_your_claim: '//a[normalize-space(.)=\'Completing your claim\']',
  your_details: '//a[normalize-space(.)=\'Your details\']',
  their_details: '//a[normalize-space(.)=\'Their details\']',
  claim_amount: '//a[normalize-space(.)=\'Claim amount\']',
  claim_details: '//a[normalize-space(.)=\'Claim details\']',
  check_and_submit_your_claim: '//a[normalize-space(.)=\'Check and submit your claim\']',
};
