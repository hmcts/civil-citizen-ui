const CaseProgressionLatestUpdate = require("../pages/caseProgression/caseProgressionLatestUpdate");
const ContactUs = require("../pages/common/contactUs");


const I = actor(); // eslint-disable-line no-unused-vars
const caseProgressionLatestUpdatePage = new CaseProgressionLatestUpdate();



class UploadEvidenceSteps {

  initiateUploadEvidenceJourney(claimRef) {
    caseProgressionLatestUpdatePage.open(claimRef);
    caseProgressionLatestUpdatePage.nextAction('Upload documents')
  }

  initiateHearingNoticeJourney(claimRef) {
    caseProgressionLatestUpdatePage.open(claimRef);
    caseProgressionLatestUpdatePage.nextAction('View hearing notice')
  }

}

module.exports = new UploadEvidenceSteps();
