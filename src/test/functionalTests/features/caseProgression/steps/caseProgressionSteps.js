const LatestUpdate = require('../pages/latestUpdate');
const Documents = require('../pages/documents');
const UploadYourDocumentsIntroduction = require('../pages/uploadEvidence/uploadYourDocumentsIntroduction');
const WhatTypeOfDocumentsDoYouWantToUpload = require('../pages/uploadEvidence/whatTypeOfDocumentsDoYouWantToUpload');
const UploadYourDocument = require('../pages/uploadEvidence/uploadYourDocument');
const CheckYourAnswers = require('../pages/uploadEvidence/checkYourAnswers');
const UploadYourDocumentsConfirmation = require('../pages/uploadEvidence/uploadYourDocumentsConfirmation');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const documentsTab = new Documents();
const uploadYourDocumentsIntroduction = new UploadYourDocumentsIntroduction();
const whatTypeOfDocumentsDoYouWantToUpload = new WhatTypeOfDocumentsDoYouWantToUpload();
const uploadYourDocument = new UploadYourDocument();
const checkYourAnswers = new CheckYourAnswers();
const uploadYourDocumentsConfirmation = new UploadYourDocumentsConfirmation();

class UploadEvidenceSteps {

  initiateUploadEvidenceJourney(claimRef, claimType) {

    console.log('The value of the Claim Reference : '+claimRef);
    latestUpdateTab.open(claimRef , claimType);
    latestUpdateTab.nextAction('Upload documents');
    uploadYourDocumentsIntroduction.verifyPageContent();
    uploadYourDocumentsIntroduction.nextAction('Start now');
    whatTypeOfDocumentsDoYouWantToUpload.verifyPageContent(claimType);
    whatTypeOfDocumentsDoYouWantToUpload.checkAllDocumentUploadOptions(claimType);
    whatTypeOfDocumentsDoYouWantToUpload.nextAction('Continue');
    uploadYourDocument.verifyPageContent(claimType);
    if (claimType === 'FastTrack') {
      uploadYourDocument.inputDataForFastTrackSections(claimType);
    } else {
      uploadYourDocument.inputDataForSmallClaimsSections(claimType);
    }
    uploadYourDocument.nextAction('Continue');
    checkYourAnswers.verifyPageContent(claimType);
    checkYourAnswers.clickConfirm();
    checkYourAnswers.nextAction('Submit');
    uploadYourDocumentsConfirmation.verifyPageContent();
    uploadYourDocumentsConfirmation.nextAction('View documents');
    documentsTab.verifyLatestUpdatePageContent(claimType);
  }

  initiateHearingNoticeJourney(claimRef) {
    latestUpdateTab.open(claimRef);
    latestUpdateTab.nextAction('View hearing notice');
  }

  verifyLatestUpdatePageForCaseProgressionState(claimRef, claimType)  {
    latestUpdateTab.open(claimRef, claimType,false);
  }

  verifyLatestUpdatePageForCaseStruckOut(claimRef, claimType)  {
    latestUpdateTab.open(claimRef, claimType, false, false, false, false, true);
  }

  verifyAnOrderHasBeenMadeOnTheClaim(claimRef, claimType)  {
    latestUpdateTab.open(claimRef, claimType,false, true);
    latestUpdateTab.nextAction('View the order');
  }

  verifyDocumentsUploadedBySolicitor(claimRef, claimType) {
    documentsTab.open(claimRef, claimType, true);
  }

}

module.exports = new UploadEvidenceSteps();
