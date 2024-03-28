const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="disability"]',
  noButton: 'input[id="disability-2"]',
};

const content = {
  heading: {
    en: 'Are you disabled?',
    cy: 'A oes gennych anabledd?',
  },
};

class DisabilityDetails {

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

module.exports = DisabilityDetails;
