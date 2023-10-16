const LatestUpdate = require('../pages/latestUpdate');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();

class UploadEvidenceSteps {

  initiateTrialArrangeentJourney(claimRef, claimType) {

    console.log('The value of the Claim Reference : ' + claimRef);
    latestUpdateTab.open(claimRef, claimType, true, false, true);
    latestUpdateTab.nextAction('Upload documents');
  }
}

module.exports = new UploadEvidenceSteps();
