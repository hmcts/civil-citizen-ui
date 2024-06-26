const config =  require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');
const I = actor();

const fields ={
  issuesTextField: 'textarea[id="disclosureOfElectronicDocumentsIssues"]',
};

const content = {
  heading: {
    en: 'Disclosure of electronic documents',
  },
  descriptionText: {
    en: 'What are the issues about disclosure of electronic documents?',
  },
};

class DisclosureOfElectronicDocumentsIssues {
  async provideDisclosureOfElecDocumentsIssues() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.fillField(fields.issuesTextField, 'Test electronic document issues');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = DisclosureOfElectronicDocumentsIssues;
