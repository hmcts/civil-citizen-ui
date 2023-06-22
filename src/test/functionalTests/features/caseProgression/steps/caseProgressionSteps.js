const LatestUpdate = require("../pages/latestUpdate");
const UploadYourDocumentsIntroduction = require("../pages/uploadYourDocumentsIntroduction");
const ContactUs = require("../../common/contactUs");


const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdatePage = new LatestUpdate();
const uploadYourDocumentsIntroduction = new UploadYourDocumentsIntroduction();



class UploadEvidenceSteps {

  initiateUploadEvidenceJourney(claimRef) {
    console.log('The value of the Claim Reference : '+claimRef);
    latestUpdatePage.open(claimRef);
    latestUpdatePage.nextAction('Upload documents');
    uploadYourDocumentsIntroduction.verifyPageContent(claimRef);
    uploadYourDocumentsIntroduction.nextAction('Start now');
  }

  initiateHearingNoticeJourney(claimRef) {
    latestUpdatePage.open(claimRef);
    latestUpdatePage.nextAction('View hearing notice')
  }

}

module.exports = new UploadEvidenceSteps();
