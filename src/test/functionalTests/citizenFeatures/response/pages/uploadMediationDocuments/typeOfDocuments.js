const I = actor();
const config = require('../../../../../config');

const fields = {
  yourStatement: 'input[value="YOUR_STATEMENT"]',
  docReferred: 'input[value="DOCUMENTS_REFERRED_TO_IN_STATEMENT"]',
};

class TypeOfDocuments {

  async verifyDocuments() {
    await I.waitForContent('Mediation non-attendance', config.WaitForText);
    await I.see('Select the types of documents that apply to your case.');
    await I.click('Continue');
    await I.waitForContent('You must select at least one type of document');
  }
  async selectDocuments(docType) {
    await I.waitForContent('Mediation non-attendance', config.WaitForText);
    if (docType === 'Your statement') {
      await I.checkOption(fields.yourStatement);
    } else if (docType === 'Documents referred to in the statement') {
      await I.checkOption(fields.docReferred);
    }
  }

  async unSelectDocuments(docType) {
    await I.waitForContent('Mediation non-attendance', config.WaitForText);
    if (docType === 'Your statement') {
      await I.uncheckOption(fields.yourStatement);
    } else if (docType === 'Documents referred to in the statement') {
      await I.uncheckOption(fields.docReferred);
    }
  }
}

module.exports = TypeOfDocuments;
