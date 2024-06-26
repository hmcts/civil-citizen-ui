const config = require('../../../../config');
const I = actor();
const {testFilePath} = require('../../../sharedData');

const fields = {
  documentType1: 'select[id="translatedDocuments_0_documentType"]',
  document1: 'input[id="translatedDocuments_0_file"]',
};

class UploadTranslatedDocuments {
  async startEvent(claimRef) {
    await I.amOnPage(config.url.manageCase + '/cases/case-details/' + claimRef + '/trigger/UPLOAD_TRANSLATED_DOCUMENT/UPLOAD_TRANSLATED_DOCUMENTUploadTranslatedDocument');  
  }

  async verifyContent() {
    await I.waitForText('Upload translated document', config.WaitForText);
    await I.see('Translated Document');
  }

  async uploadTranslatedDocument() {
    await I.click('Add new');
    await I.see('Document Type');
    await I.see('Document');
    await I.selectOption(fields.documentType1, 'Defendant Response');
    await I.attachFile(fields.document1, testFilePath);
    await I.waitForInvisible(locate('.error-message').withText('Uploading...'));
    await I.click('Continue');
  }
}

module.exports = new UploadTranslatedDocuments();