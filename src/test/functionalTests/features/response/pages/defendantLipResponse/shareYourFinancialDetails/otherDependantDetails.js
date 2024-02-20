const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  numberOfPeople: 'input[id="numberOfPeople"]',
  otherDetails: 'textarea[id="details"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class OtherDependantDetails {

  async clickYesButton() {
    await I.waitForText('Do you support anyone else financially?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.numberOfPeople, '2');
    await I.fillField(fields.otherDetails, 'Parents');
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.see('Do you support anyone else financially?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = OtherDependantDetails;
