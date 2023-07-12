const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: '#option',
  noButton: '#option-2',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SevereDisabilityDetails {

  async clickYesButton() {
    await I.waitForText('Are you severely disabled?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Are you severely disabled?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = SevereDisabilityDetails;
