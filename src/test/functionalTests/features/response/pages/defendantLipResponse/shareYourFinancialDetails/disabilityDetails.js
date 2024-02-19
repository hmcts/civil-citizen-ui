const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="disability"]',
  noButton: 'input[id="disability-2"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Are you disabled?',
    cy: 'A oes gennych anabledd?',
  },
};

class DisabilityDetails {

  async clickYesButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.saveAndContinue);
  }

  async clickNoButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = DisabilityDetails;
