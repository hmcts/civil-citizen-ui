const CaseProgressionLatestUpdate = require("../pages/caseProgression/caseProgressionLatestUpdate");


const I = actor(); // eslint-disable-line no-unused-vars
const caseProgressionLatestUpdatePage = new CaseProgressionLatestUpdate();


class UploadEvidenceSteps {
  initiateUploadEvidenceJourney(claimRef) {
    caseProgressionLatestUpdatePage.open(claimRef);
  }

}

module.exports = new UploadEvidenceSteps();
