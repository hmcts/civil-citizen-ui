const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="partnerDisability"]',
  noButton: 'input[id="partnerDisability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerDisabilityDetails {

  async clickYesButton() {
    await I.waitForText('Is your partner disabled?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Is your partner disabled?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = PartnerDisabilityDetails;
