const ClaimantLatestUpdate = require("../pages/claimantResponse/ClaimantCaseDetails");
const claimantLatestUpdate = new ClaimantLatestUpdate();

class LRclaimantResponseSteps {

  ClaimantRespond(claimRef) {
    claimantLatestUpdate.openClaimant(claimRef);
  }
}

module.exports = new LRclaimantResponseSteps();
