const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  amountYouOwe: 'input[id="amountYouOwe"]',
  reason: 'textarea[id="reason"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SelfEmploymentTaxDetails {

  async clickYesButton() {
    await I.waitForText('Are you behind on tax payments?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.amountYouOwe, '2000');
    await I.fillField(fields.reason, 'Last year pending');
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Are you behind on tax payments?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = SelfEmploymentTaxDetails;
