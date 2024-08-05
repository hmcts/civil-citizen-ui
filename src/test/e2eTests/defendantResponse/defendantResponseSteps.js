const I = actor();
const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {resetScenarios} = require("../../functionalTests/specClaimHelpers/api/wiremock");


const paths = {
  links: {
    view_defendants_response: '//a[.="View the defendant\'s response"]',
    accept_or_reject: '//a[.=\'Accept or reject the £1000.00\']',
    accept_or_reject_their_response: '//a[.=\'Accept or reject their response\']',
    accept_or_reject_the_payment_plan: '//a[contains(.,\'Accept or reject their repayment plan\')]',
    accept_or_reject_the_plan: '//a[contains(.,\'Accept or reject\')]',
    how_to_formalise_repayment: '//a[.=\'Choose how to formalise repayment\']',
    sign_a_settlements_agreement: '//a[.=\'Sign a settlement agreement\']',
    request_a_CCJ: '//a[.=\'Request a County Court Judgment\']',
    check_and_submit_your_response : '//a[.=\'Check and submit your response\']',
    decide_whether_to_proceed : '//a[.=\'Decide whether to proceed\']',
    free_mediation: '//a[.=\'Free telephone mediation\']',
    details_in_case_of_a_hearing : '//a[.="Give us details in case there\'s a hearing"]',
    have_you_been_paid: '//a[contains(text(), \'Have you been paid the\')]',
    settle_the_claim_for: '//a[contains(text(), \'Settle the claim for\')]',
    propose_alternative_plan: '//a[contains(text(), \'Propose an alternative repayment plan\')]',
  },
  options: {
    english_language : '#speakLanguage',
    document_language : '#documentsLanguage',
    directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
    ssaSigned: '#signed',
  }
};

class DefendantResponseSteps {
  async signSettlementAgreement(caseId) {
    await I.amOnPage(`/case/${caseId}/settlement-agreement/sign-settlement-agreement`);
    await I.click('Yes - I confirm I\'ve read and accept the terms of the agreement.');
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  async partAdmitPayBySetDateDefendantSignsSettlementAgreementConfirmation() {
    await I.see('You\'ve both signed a settlement agreement');
    await I.see('The agreement says you\'ll repay by');
    await I.see('The claimant can\'t request a County Court Judgment against you unless you break the terms.');
    await I.see('Contact Miss Jane Doe if you need their payment details.');
    await I.see('Make sure you get receipts for any payments.');
  }

  async partAdmitPayByInstallmentsDefendantSignsSettlementAgreementConfirmation() {
    await I.see('You\'ve both signed a settlement agreement');
    await I.see('The claimant can\'t request a County Court Judgment against you unless you break the terms.');
    await I.see('What happens next');
    await I.see('Contact Miss Jane Doe if you need their payment details.');
    await I.see('Make sure you get receipts for any payments.');
  }

  async resetWiremockScenario() {
    await resetScenarios();
  }
}

module.exports = new DefendantResponseSteps();
