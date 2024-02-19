const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: '#option',
  noButton: '#option-2',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = { 
  heading: {
    en: 'Are you severely disabled?',
    cy: 'Ydych chi\'n anabl iawn?',
  },
};

class SevereDisabilityDetails {

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

module.exports = SevereDisabilityDetails;
