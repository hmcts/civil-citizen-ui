const LatestUpdate = require('../pages/latestUpdate');
const Documents = require('../pages/documents');
const ViewDocuments = require('../pages/viewDocuments');
const Bundles = require('../pages/bundles');
const UploadYourDocumentsIntroduction = require('../pages/uploadEvidence/uploadYourDocumentsIntroduction');
const WhatTypeOfDocumentsDoYouWantToUpload = require('../pages/uploadEvidence/whatTypeOfDocumentsDoYouWantToUpload');
const UploadYourDocument = require('../pages/uploadEvidence/uploadYourDocument');
const CheckYourAnswers = require('../pages/uploadEvidence/checkYourAnswers');
const UploadYourDocumentsConfirmation = require('../pages/uploadEvidence/uploadYourDocumentsConfirmation');

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
    await uploadYourDocumentsIntroduction.verifyPageContent(claimRef, claimAmount, language);
    await uploadYourDocumentsIntroduction.nextAction(buttons.startNow[language]);
    await whatTypeOfDocumentsDoYouWantToUpload.verifyPageContent(claimRef, claimAmount, claimType);
    await whatTypeOfDocumentsDoYouWantToUpload.checkAllDocumentUploadOptions(claimType);
    await whatTypeOfDocumentsDoYouWantToUpload.nextAction(buttons.continue[language]);
    await uploadYourDocument.verifyPageContent(claimRef, claimAmount, claimType);
    if (claimType === 'FastTrack') {
      await uploadYourDocument.inputDataForFastTrackSections(claimType);
    } else {
      await uploadYourDocument.inputDataForSmallClaimsSections(claimType);
    }
    await uploadYourDocument.nextAction(buttons.continue[language]);
    await checkYourAnswers.verifyPageContent(claimRef, claimAmount, claimType, partyType);
    await checkYourAnswers.clickConfirm();
    await checkYourAnswers.nextAction(buttons.submit[language]);
    await uploadYourDocumentsConfirmation.verifyPageContent();
    await uploadYourDocumentsConfirmation.nextAction(buttons.viewDocuments[language]);
    if (claimType === 'FastTrack') {
      claimAmount = '£15,000.00';
    } else {
      claimAmount = '£1,500.00';
    }
    await viewDocumentsPage.verifyPageContent(claimRef, claimAmount, dateUploaded, claimType, partyType);
    await viewDocumentsPage.nextAction('Close and return to case overview');
  }

  async initiateHearingNoticeJourney(claimRef) {
    await latestUpdateTab.open(claimRef);
    await latestUpdateTab.nextAction('View hearing notice');
  }

  async verifyLatestUpdatePageForCaseProgressionState(claimRef, claimType, hearingInitiated = false)  {
    await latestUpdateTab.open(claimRef, claimType, hearingInitiated);
  }

  async verifyLatestUpdatePageForCaseStruckOut(claimRef, claimType)  {
    await latestUpdateTab.open(claimRef, claimType, false, false, false, false, true);
  }

  async verifyAnOrderHasBeenMadeOnTheClaim(claimRef, claimType)  {
    await latestUpdateTab.open(claimRef, claimType,false, true);
    await latestUpdateTab.nextAction('View the order');
  }

  async verifyDocumentsUploadedBySolicitor(claimRef, claimType) {
    await documentsTab.open(claimRef, claimType, true);
  }

  async verifyBundle(claimRef, claimType) {
    await latestUpdateTab.open(claimRef, claimType,true, false, false, false, false, true);
    await bundlesTab.open(claimRef);
  }
}

module.exports = new CaseProgressionSteps();
