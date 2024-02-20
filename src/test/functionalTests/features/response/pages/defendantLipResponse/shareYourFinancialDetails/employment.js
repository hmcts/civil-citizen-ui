const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

const buttons = {
  continue: 'button.govuk-button',
};

const checkBoxes = {
  employed: {
    en: 'Employed',
    cy: 'Cyflogedig',
  },
  selfEmployed: {
    en: 'Self-employed',
    cy: 'Hunangyflogedig',
  },
};

const content = {
  heading: {
    en: 'Do you have a job?',
    cy: 'A oes gennych swydd?',
  },
};

class EmploymentDetails {

  async clickYesButton() {
    const language = sharedData.language;
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.checkOption(checkBoxes.employed[language]);
    await I.checkOption(checkBoxes.selfEmployed[language]);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.see(content.heading[sharedData.language], 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = EmploymentDetails;
