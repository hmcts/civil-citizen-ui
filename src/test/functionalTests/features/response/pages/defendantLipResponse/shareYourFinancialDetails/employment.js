const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  employment: 'Employed',
  selfEmployment: 'Self-employed',
};
const buttons = {
  continue: 'button.govuk-button',
};

class EmploymentDetails {

  async clickYesButton() {
    await I.waitForText('Do you have a job?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.checkOption(fields.employment);
    await I.checkOption(fields.selfEmployment);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.see('Do you have a job?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = EmploymentDetails;
