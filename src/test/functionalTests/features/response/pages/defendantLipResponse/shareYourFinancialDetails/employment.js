const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  employment: 'Employed',
  selfEmployment: 'Self-employed',
};
const buttons = {
  continue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Do you have a job?',
    cy: 'A oes gennych swydd?'
  }
}

class EmploymentDetails {

  async clickYesButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.checkOption(fields.employment);
    await I.checkOption(fields.selfEmployment);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.see(content.heading[language], 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = EmploymentDetails;
