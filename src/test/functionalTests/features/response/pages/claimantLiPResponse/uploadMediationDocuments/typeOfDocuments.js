const I = actor();
const config = require('../../../../../../config');

const fields = {
  yourStatement: 'input[value="YOUR_STATEMENT"]',
  docReferred: 'input[value="DOCUMENTS_REFERRED_TO_IN_STATEMENT"]'
};

class TypeOfDocuments {
  async verifyAndSelectDocuments(docType) {
    I.waitForContent('Mediation non-attendance', config.WaitForText);
    I.see('Select the types of documents that apply to your case.');
    I.click('Continue');
    I.waitForContent('You must select at least one type of document');
    if (docType === 'Your statement') {
      I.click(fields.yourStatement);
    } else if (docType === 'Documents referred to in the statement') {
      I.click(fields.docReferred);
    } else {
      I.click(fields.yourStatement);
      I.click(fields.docReferred);
    }
    I.click('Continue');
  }
}

module.exports = TypeOfDocuments;
