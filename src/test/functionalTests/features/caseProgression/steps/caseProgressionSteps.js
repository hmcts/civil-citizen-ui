const LatestUpdate = require('../pages/latestUpdate');
const UploadYourDocumentsIntroduction = require('../pages/uploadEvidence/uploadYourDocumentsIntroduction');
const WhatTypeOfDocumentsDoYouWantToUpload = require('../pages/uploadEvidence/whatTypeOfDocumentsDoYouWantToUpload');
const UploadYourDocument = require('../pages/uploadEvidence/uploadYourDocument');
const CheckYourAnswers = require('../pages/uploadEvidence/checkYourAnswers');
const UploadYourDocumentsConfirmation = require('../pages/uploadEvidence/uploadYourDocumentsConfirmation');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdatePage = new LatestUpdate();
const uploadYourDocumentsIntroduction = new UploadYourDocumentsIntroduction();
const whatTypeOfDocumentsDoYouWantToUpload = new WhatTypeOfDocumentsDoYouWantToUpload();
const uploadYourDocument = new UploadYourDocument();
const checkYourAnswers = new CheckYourAnswers();
const uploadYourDocumentsConfirmation = new UploadYourDocumentsConfirmation();

class UploadEvidenceSteps {

  initiateUploadEvidenceJourney(claimRef, claimType) {

    console.log('The value of the Claim Reference : '+claimRef);
    latestUpdatePage.open(claimRef , claimType);
    latestUpdatePage.nextAction('Upload documents');
    uploadYourDocumentsIntroduction.verifyPageContent();
    uploadYourDocumentsIntroduction.nextAction('Start now');
    whatTypeOfDocumentsDoYouWantToUpload.verifyPageContent(claimType);
    whatTypeOfDocumentsDoYouWantToUpload.checkAllDocumentUploadOptions();
    whatTypeOfDocumentsDoYouWantToUpload.nextAction('Continue');
    uploadYourDocument.verifyPageContent(claimType);
    uploadYourDocument.inputDataForAllSections();
    uploadYourDocument.nextAction('Continue');
    checkYourAnswers.verifyPageContent(claimType);
    checkYourAnswers.clickConfirm();
    checkYourAnswers.nextAction('Submit');
    uploadYourDocumentsConfirmation.verifyPageContent();
  }

  initiateHearingNoticeJourney(claimRef) {
    latestUpdatePage.open(claimRef);
    latestUpdatePage.nextAction('View hearing notice');
  }

}

module.exports = new UploadEvidenceSteps();
