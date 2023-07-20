const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="disability"]',
  noButton: 'input[id="disability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class DisabilityDetails {

  async clickYesButton() {
    await I.waitForText('Are you disabled?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Are you disabled?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = DisabilityDetails;
