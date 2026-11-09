const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]',
};

const content = {
  heading: {
    en: 'Are you severely disabled?',
    cy: 'Ydych chi\'n anabl iawn?',
  },
};

class SevereDisabilityDetails {

  async clickYesButton() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[sharedData.language], config.WaitForText);
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

module.exports = SevereDisabilityDetails;
