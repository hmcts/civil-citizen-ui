const config =  require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');
const I = actor();

const fields ={
  issuesTextField: 'textarea[id="disclosureNonElectronicDocuments"]',
};

const content = {
  heading: {
    en: 'Disclosure of non-electronic documents',
  },
  descriptionText: {
    en: 'What non-electronic documents are proposed for disclosure?',
  },
};

class DisclosureOfNonElectronicDocuments {
  async provideDisclosureOfNonElecDocuments() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.fillField(fields.issuesTextField, 'Test non electronic document');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = DisclosureOfNonElectronicDocuments;
