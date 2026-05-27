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
    await I.waitForContent('Mediation non-attendance', config.WaitForText);
    await I.see('Your statement');
    await I.see('Documents referred to in the statement');
    await I.click('Continue');
    await I.waitForContent('You must enter your name');
    await I.waitForContent('Enter the date the statement was written or document was produced');
    await I.see('Choose the file you want to upload');
    await I.see('You must enter type of document');
  }

  async uploadDocuments(docType, file) {
    await I.waitForContent('Mediation non-attendance', config.WaitForText);
    if (docType === 'Your statement') {
      await I.fillField(fields.yourName, 'LIP claimant test');
      await I.fillField(fields.statementDay, '08');
      await I.fillField(fields.statementMonth, '09');
      await I.fillField(fields.statementYear, '2010');
      await I.attachFile(fields.statementFile, file);
      await I.click(fields.statementUploadButton);
    } else if (docType === 'Documents referred to in the statement') {
      await I.fillField(fields.yourDoc, 'LIP test doc');
      await I.fillField(fields.docDay, '08');
      await I.fillField(fields.docMonth, '09');
      await I.fillField(fields.docYear, '2011');
      await I.attachFile(fields.docFile, file);
      await I.click(fields.docUploadButton);
    }
  }

  async clickContinue() {
    await I.click(cButtons.continue[sharedData.language]);
    await I.wait(2);
  }

  async clickBackButton() {
    await I.click('Back');
    await I.wait(2);
  }
}

module.exports = UploadDocuments;
