const LatestUpdate = require('../pages/latestUpdate');
const Documents = require('../pages/documents');
const Bundles = require('../pages/bundles');
const UploadYourDocumentsIntroduction = require('../pages/uploadEvidence/uploadYourDocumentsIntroduction');
const WhatTypeOfDocumentsDoYouWantToUpload = require('../pages/uploadEvidence/whatTypeOfDocumentsDoYouWantToUpload');
const UploadYourDocument = require('../pages/uploadEvidence/uploadYourDocument');
const CheckYourAnswers = require('../pages/uploadEvidence/checkYourAnswers');
const UploadYourDocumentsConfirmation = require('../pages/uploadEvidence/uploadYourDocumentsConfirmation');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const documentsTab = new Documents();
const bundlesTab = new Bundles();
const uploadYourDocumentsIntroduction = new UploadYourDocumentsIntroduction();
const whatTypeOfDocumentsDoYouWantToUpload = new WhatTypeOfDocumentsDoYouWantToUpload();
const uploadYourDocument = new UploadYourDocument();
const checkYourAnswers = new CheckYourAnswers();
const uploadYourDocumentsConfirmation = new UploadYourDocumentsConfirmation();

class CaseProgressionSteps {

  initiateUploadEvidenceJourney(claimRef, claimType) {

    console.log('The value of the Claim Reference : '+claimRef);
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

  verifyLatestUpdatePageForCaseProgressionState(claimRef, claimType, hearingInitiated = false)  {
    latestUpdateTab.open(claimRef, claimType, hearingInitiated);
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

  verifyBundle(claimRef, claimType) {
    latestUpdateTab.open(claimRef, claimType,true, false, false, false, false, true);
    bundlesTab.open(claimRef);
  }
}

module.exports = new CaseProgressionSteps();
