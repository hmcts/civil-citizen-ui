const I = actor();
const config = require('../../../../../../config');
const cButtons = require('../../../../../commonComponents/cButtons');
const sharedData = require('../../../../../sharedData');

const fields ={
  textArea: 'textarea[id="reasonsForBandSelection"]',
};

const content = {
  heading: {
    en: 'Complexity band',
  },
  descriptionText: {
    en: 'Reasons for band selection',
  },
};

class ReasonForComplexityBand {

  async TypeReasonForBand() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.fillField(fields.textArea,'Test band reason');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = ReasonForComplexityBand;
