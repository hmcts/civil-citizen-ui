const I = actor();
const config = require('../../../../../config');
const cButtons = require('../../../../commonComponents/cButtons');
const sharedData = require('../../../../sharedData');

const fields = {
  yourName: 'input[id*="yourName"]',
  statementDay: 'div[id*="documentsForYourStatement"] input[id*="dateDay"]',
  statementMonth: 'div[id*="documentsForYourStatement"] input[id*="dateMonth"]',
  statementYear: 'div[id*="documentsForYourStatement"] input[id*="dateYear"]',
  statementFile: 'input[id="documentsForYourStatement[0][fileUpload]"]',
  statementUploadButton: 'button[value="documentsForYourStatement[0][uploadButton]"]',
  yourDoc: 'input[id*="typeOfDocument"]',
  docDay: 'div[id*="documentsForDocumentsReferred"] input[id*="dateDay"]',
  docMonth: 'div[id*="documentsForDocumentsReferred"] input[id*="dateMonth"]',
  docYear: 'div[id*="documentsForDocumentsReferred"] input[id*="dateYear"]',
  docFile: 'input[id="documentsForDocumentsReferred[0][fileUpload]"]',
  docUploadButton: 'button[value="documentsForDocumentsReferred[0][uploadButton]"]',
};

class UploadDocuments {
  async verifyUploadDocumentsPage() {
    I.waitForContent('Mediation non-attendance', config.WaitForText);
    I.see('Your statement');
    I.see('Documents referred to in the statement');
    I.click('Continue');
    I.waitForContent('You must enter your name');
    I.waitForContent('Enter the date the statement was written or document was produced');
    I.see('Choose the file you want to upload');
    I.see('You must enter type of document');
  }

  async uploadDocuments(docType, file) {
    I.waitForContent('Mediation non-attendance', config.WaitForText);
    if (docType === 'Your statement') {
      I.fillField(fields.yourName, 'LIP claimant test');
      I.fillField(fields.statementDay, '08');
      I.fillField(fields.statementMonth, '09');
      I.fillField(fields.statementYear, '2010');
      I.attachFile(fields.statementFile, file);
      I.click(fields.statementUploadButton);
    } else if (docType === 'Documents referred to in the statement') {
      I.fillField(fields.yourDoc, 'LIP test doc');
      I.fillField(fields.docDay, '08');
      I.fillField(fields.docMonth, '09');
      I.fillField(fields.docYear, '2011');
      I.attachFile(fields.docFile, file);
      I.click(fields.docUploadButton);
    }
  }

  async clickContinue() {
    I.click(cButtons.continue[sharedData.language]);
    I.wait(2);
  }

  async clickBackButton() {
    I.click('Back');
    I.wait(2);
  }
}

module.exports = UploadDocuments;
