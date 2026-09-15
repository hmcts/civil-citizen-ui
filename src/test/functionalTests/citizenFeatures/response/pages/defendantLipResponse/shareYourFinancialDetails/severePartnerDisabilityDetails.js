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
    en: 'Is your partner severely disabled?',
    cy: 'A oes gan eich partner anabledd difrifol?',
  },
};

class SeverePartnerDisabilityDetails {

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

module.exports = SeverePartnerDisabilityDetails;
