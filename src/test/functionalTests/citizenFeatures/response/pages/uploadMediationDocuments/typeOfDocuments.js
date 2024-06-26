const I = actor();
const config = require('../../../../../config');

const fields = {
  yourStatement: 'input[value="YOUR_STATEMENT"]',
  docReferred: 'input[value="DOCUMENTS_REFERRED_TO_IN_STATEMENT"]',
};

class TypeOfDocuments {

  async verifyDocuments() {
    I.waitForContent('Mediation non-attendance', config.WaitForText);
    I.see('Select the types of documents that apply to your case.');
    I.click('Continue');
    I.waitForContent('You must select at least one type of document');
  }
  async selectDocuments(docType) {
    I.waitForContent('Mediation non-attendance', config.WaitForText);
    if (docType === 'Your statement') {
      I.checkOption(fields.yourStatement);
    } else if (docType === 'Documents referred to in the statement') {
      I.checkOption(fields.docReferred);
    }
  }

  async unSelectDocuments(docType) {
    I.waitForContent('Mediation non-attendance', config.WaitForText);
    if (docType === 'Your statement') {
      I.uncheckOption(fields.yourStatement);
    } else if (docType === 'Documents referred to in the statement') {
      I.uncheckOption(fields.docReferred);
    }
  }
}

module.exports = TypeOfDocuments;
