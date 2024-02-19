const I = actor();
const config = require('../../../../../../config');
const language = require('../../../../../sharedData').language;

const fields ={
  yesButton: 'input[id="partnerAge"]',
  noButton: 'input[id="partnerAge-2"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Is your partner aged 18 or over?',
    cy: 'A yw eich partner yn 18 oed neu\'n hŷn?',
  },
};

class PartnerAgeDetails {

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
module.exports = PartnerAgeDetails;
