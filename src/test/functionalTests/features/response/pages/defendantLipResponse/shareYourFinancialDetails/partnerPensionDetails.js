const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="partnerPension"]',
  noButton: 'input[id="partnerPension-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerPensionDetails {

  async clickYesButton() {
    await I.waitForText('Does your partner receive a pension?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Does your partner receive a pension?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = PartnerPensionDetails;
