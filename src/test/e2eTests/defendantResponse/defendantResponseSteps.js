const I = actor();
const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {resetScenarios} = require('../../functionalTests/specClaimHelpers/api/wiremock');

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
