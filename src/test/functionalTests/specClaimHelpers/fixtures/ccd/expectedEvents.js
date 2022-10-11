const events = require('./events.js.js');

module.exports = {
  applicant_solicitor: {
    CASE_ISSUED: [
      events.NOTIFY_DEFENDANT_OF_CLAIM,
      events.ADD_OR_AMEND_CLAIM_DOCUMENTS,
    ],
  },
};
