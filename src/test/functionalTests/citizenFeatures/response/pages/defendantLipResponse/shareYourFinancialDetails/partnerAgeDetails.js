const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]'
};

const content = {
  heading: {
    en: 'Is your partner aged 18 or over?',
    cy: 'A yw eich partner yn 18 oed neu\'n hŷn?',
  },
};

class PartnerAgeDetails {

  async clickYesButton() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
  }

  async clickNoButton() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}
module.exports = PartnerAgeDetails;
