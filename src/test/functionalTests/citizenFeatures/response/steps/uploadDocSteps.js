const TypeOfDocuments = require('../pages/claimantLiPResponse/uploadMediationDocuments/typeOfDocuments');
const UploadDocuments = require('../pages/claimantLiPResponse/uploadMediationDocuments/uploadDocuments');
const CheckYourAnswers = require('../pages/claimantLiPResponse/uploadMediationDocuments/checkYourAnswers');
const Confirmation = require('../pages/claimantLiPResponse/uploadMediationDocuments/confirmation');

const typeOfDocuments = new TypeOfDocuments();
const uploadDocuments = new UploadDocuments();
const cya = new CheckYourAnswers();
const confirmation = new Confirmation();
const TEST_FILE_PATH = 'features/caseProgression/data/TestPDF.pdf';

class UploadMediationDocSteps {
  async VerifyDocuments() {
    await typeOfDocuments.verifyDocuments();
  }

  async SelectDocuments(docType) {
    await typeOfDocuments.selectDocuments(docType);
  }

  async UnSelectDocuments(docType) {
    await typeOfDocuments.unSelectDocuments(docType);
  }

  async VerifyUploadDocumentsPage() {
    await uploadDocuments.verifyUploadDocumentsPage();
  }
  async UploadDocuments(docType) {
    await uploadDocuments.uploadDocuments(docType, TEST_FILE_PATH);
  }

  async ClickContinue() {
    await uploadDocuments.clickContinue();
  }

  async ClickBackButton() {
    await uploadDocuments.clickBackButton();
  }

  async CheckAndSendMediationDocs(type) {
    await cya.checkAndSendMediationDocs(type);
  }

  async VerifyConfirmationPage() {
    await confirmation.verifyConfirmationPage();
  }
}

module.exports = new UploadMediationDocSteps();
