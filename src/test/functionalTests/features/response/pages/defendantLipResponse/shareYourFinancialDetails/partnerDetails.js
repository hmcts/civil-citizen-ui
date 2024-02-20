const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerDetails {

  async clickYesButton() {
    await I.waitForText('Do you live with a partner?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Do you live with a partner?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = PartnerDetails;
