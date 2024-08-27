const I = actor();
const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {resetScenarios} = require('../../functionalTests/specClaimHelpers/api/wiremock');

class DefendantResponseSteps {
  signSettlementAgreement(caseId) {
    I.amOnPage(`/case/${caseId}/settlement-agreement/sign-settlement-agreement`);
    I.click('Yes - I confirm I\'ve read and accept the terms of the agreement.');
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  partAdmitPayBySetDateDefendantSignsSettlementAgreementConfirmation() {
    I.see('You\'ve both signed a settlement agreement');
    I.see('The agreement says you\'ll repay by');
    I.see('The claimant can\'t request a County Court Judgment against you unless you break the terms.');
    I.see('Contact Miss Jane Doe if you need their payment details.');
    I.see('Make sure you get receipts for any payments.');
  }

  partAdmitPayByInstallmentsDefendantSignsSettlementAgreementConfirmation() {
    I.see('You\'ve both signed a settlement agreement');
    I.see('The claimant can\'t request a County Court Judgment against you unless you break the terms.');
    I.see('What happens next');
    I.see('Contact Miss Jane Doe if you need their payment details.');
    I.see('Make sure you get receipts for any payments.');
  }

  async resetWiremockScenario() {
    await resetScenarios();
  }
}

module.exports = new DefendantResponseSteps();
