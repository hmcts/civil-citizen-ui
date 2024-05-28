const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  reason: 'textarea[id="text"]',
};
const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

const content = {
  heading: {
    en: 'Briefly explain why you can\'t pay immediately',
    cy: 'Esboniwch yn fras pam na allwch dalu ar unwaith',
  },
};

const inputs = {
  reason: {
    en: 'Test reason',
    cy: 'Rheswm Prawf',
  },
};

class Explanation {
  async enterExplanation() {
    const { language } = sharedData; 
    await I.waitForElement(fields.reason, config.WaitForText);
    await I.see(content.heading[language]);
    await I.fillField(fields.reason, inputs.reason[language]);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = Explanation;
