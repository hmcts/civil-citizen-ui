const LatestUpdate = require('../pages/latestUpdate');
const Documents = require('../pages/documents');
const ViewDocuments = require('../pages/viewDocuments');
const Bundles = require('../pages/bundles');
const UploadYourDocumentsIntroduction = require('../pages/uploadEvidence/uploadYourDocumentsIntroduction');
const WhatTypeOfDocumentsDoYouWantToUpload = require('../pages/uploadEvidence/whatTypeOfDocumentsDoYouWantToUpload');
const UploadYourDocument = require('../pages/uploadEvidence/uploadYourDocument');
const CheckYourAnswers = require('../pages/uploadEvidence/checkYourAnswers');
const UploadYourDocumentsConfirmation = require('../pages/uploadEvidence/uploadYourDocumentsConfirmation');
const {isDashboardServiceToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const documentsTab = new Documents();
const viewDocumentsPage = new ViewDocuments();
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

  async initiateUploadEvidenceJourney(claimRef, claimType, partyType, claimAmount, dateUploaded, language = 'en') {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (!isDashboardServiceEnabled) {
      console.log('The value of the Claim Reference : '+claimRef);
      if (partyType === 'LiPvLiP') {
        I.amOnPage('/case/' + claimRef + '/case-progression/upload-your-documents');
      } else {
        latestUpdateTab.nextAction('Upload documents');
      }
    }
    uploadYourDocumentsIntroduction.verifyPageContent(claimRef, claimAmount, language);
    uploadYourDocumentsIntroduction.nextAction(buttons.startNow[language]);
    whatTypeOfDocumentsDoYouWantToUpload.verifyPageContent(claimRef, claimAmount, claimType);
    whatTypeOfDocumentsDoYouWantToUpload.checkAllDocumentUploadOptions(claimType);
    whatTypeOfDocumentsDoYouWantToUpload.nextAction(buttons.continue[language]);
    uploadYourDocument.verifyPageContent(claimRef, claimAmount, claimType);
    if (claimType === 'FastTrack') {
      uploadYourDocument.inputDataForFastTrackSections(claimType);
    } else {
      uploadYourDocument.inputDataForSmallClaimsSections(claimType);
    }
    uploadYourDocument.nextAction(buttons.continue[language]);
    checkYourAnswers.verifyPageContent(claimRef, claimAmount, claimType, partyType);
    checkYourAnswers.clickConfirm();
    checkYourAnswers.nextAction(buttons.submit[language]);
    uploadYourDocumentsConfirmation.verifyPageContent();
    uploadYourDocumentsConfirmation.nextAction(buttons.viewDocuments[language]);
    if (isDashboardServiceEnabled) {
      if (claimType === 'FastTrack') {
        claimAmount = '£15,000.00';
      } else {
        claimAmount = '£1,500.00';
      }
      await viewDocumentsPage.verifyPageContent(claimRef, claimAmount, dateUploaded, claimType, partyType);
      await viewDocumentsPage.nextAction('Close and return to case overview');
    } else {
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
