const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  amountYouOwe: 'input[id="amountYouOwe"]',
  reason: 'textarea[id="reason"]',
};

const content = {
  heading: {
    en: 'Are you behind on tax payments?',
    cy: 'A ydych yn hwyr yn gwneud taliadau treth?',
  },
};

const inputs = {
  reason: {
    en: 'Last year pending',
    cy: 'Yn aros o\'r llynedd',
  },
};
class SelfEmploymentTaxDetails {

  async clickYesButton() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.amountYouOwe, '2000');
    await I.fillField(fields.reason, inputs.reason[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }

  async clickNoButton() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = SelfEmploymentTaxDetails;
