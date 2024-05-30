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

const buttons = {
  startNow: {
    en: 'Start now',
    cy: 'Dechrau nawr',
  },
  continue: {
    en: 'Continue',
    cy: 'Parhau',
  },
  submit: {
    en: 'Submit',
    cy: 'Cyflwyno',
  },
  viewDocuments: {
    en: 'View documents',
    cy: 'Gweld y dogfennau',
  },
};

class CaseProgressionSteps {

  initiateUploadEvidenceJourney(claimRef, claimType, partyType, language = 'en') {
    console.log('The value of the Claim Reference : '+claimRef);
    let partiesOnTheCase;
    if (partyType === 'LiPvLiP') {
      partiesOnTheCase = 'Miss Jane Doe v Sir John Doe';
      I.amOnPage('/case/' + claimRef + '/case-progression/upload-your-documents');
    } else {
      partiesOnTheCase = 'Test Inc v Sir John Doe';
      latestUpdateTab.nextAction('Upload documents');
    }
    uploadYourDocumentsIntroduction.verifyPageContent(language);
    uploadYourDocumentsIntroduction.nextAction(buttons.startNow[language]);
    whatTypeOfDocumentsDoYouWantToUpload.verifyPageContent(claimType, partiesOnTheCase);
    whatTypeOfDocumentsDoYouWantToUpload.checkAllDocumentUploadOptions(claimType);
    whatTypeOfDocumentsDoYouWantToUpload.nextAction(buttons.continue[language]);
    uploadYourDocument.verifyPageContent(claimType);
    if (claimType === 'FastTrack') {
      uploadYourDocument.inputDataForFastTrackSections(claimType);
    } else {
      uploadYourDocument.inputDataForSmallClaimsSections(claimType);
    }
    uploadYourDocument.nextAction(buttons.continue[language]);
    checkYourAnswers.verifyPageContent(claimType, partyType);
    checkYourAnswers.clickConfirm();
    checkYourAnswers.nextAction(buttons.submit[language]);
    uploadYourDocumentsConfirmation.verifyPageContent();
    uploadYourDocumentsConfirmation.nextAction(buttons.viewDocuments[language]);
    if (partyType !== 'LiPvLiP') {
      documentsTab.verifyLatestUpdatePageContent(claimType);
    }
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
