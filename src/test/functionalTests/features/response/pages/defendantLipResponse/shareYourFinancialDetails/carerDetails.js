const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class CarerDetails {

  async clickYesButton() {
    await I.waitForText('Do you claim Carer’s Allowance or Carer’s Credit?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.waitForText('Do you claim Carer’s Allowance or Carer’s Credit?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = CarerDetails;
