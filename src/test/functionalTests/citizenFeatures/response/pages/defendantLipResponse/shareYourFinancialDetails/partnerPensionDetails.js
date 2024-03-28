const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="partnerPension"]',
  noButton: 'input[id="partnerPension-2"]',
};

const content = {
  heading: {
    en: 'Does your partner receive a pension?',
    cy: 'A yw eich partner yn cael pensiwn?',
  },
};

class PartnerPensionDetails {

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

module.exports = PartnerPensionDetails;
