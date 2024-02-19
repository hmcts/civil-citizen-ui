const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="partnerSevereDisability"]',
  noButton: 'input[id="partnerSevereDisability-2"]',
};
const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

const content = {
  heading: {
    en: 'Is your partner severely disabled?',
    cy: 'A oes gan eich partner anabledd difrifol?',
  },
};

class SeverePartnerDisabilityDetails {

  async clickYesButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.saveAndContinue[language]);
  }

  async clickNoButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = SeverePartnerDisabilityDetails;