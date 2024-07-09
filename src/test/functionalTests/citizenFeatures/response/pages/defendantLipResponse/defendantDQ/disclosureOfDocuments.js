const config =  require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');
const I = actor();

const fields ={
  elecDocCheckBox: 'input[value="ELECTRONIC_DOCUMENTS"]',
  nonElecDocCheckBox: 'input[value="NON_ELECTRONIC_DOCUMENTS"]',
};

const content = {
  heading: {
    en: 'Disclosure of documents',
  },
  descriptionText: {
    en: 'You can ask the court to order disclosure of documents from the other parties. Do you want to request the disclosure of electronic or non-electronic documents, or both?',
  },
};

class DisclosureOfDocuments {
  async selectDisclosureOfDocuments() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.click(fields.elecDocCheckBox);
    await I.click(fields.nonElecDocCheckBox);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = DisclosureOfDocuments;
