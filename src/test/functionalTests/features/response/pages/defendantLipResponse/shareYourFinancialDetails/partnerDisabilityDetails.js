const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="partnerDisability"]',
  noButton: 'input[id="partnerDisability-2"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Is your partner disabled?',
    cy: 'A oes gan eich partner anabledd?',
  },
};

class PartnerDisabilityDetails {

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

module.exports = PartnerDisabilityDetails;
