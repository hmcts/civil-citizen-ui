const ClaimantLatestUpdate = require("../pages/claimantResponse/claimantLatestUpdate");
const claimantLatestUpdate = new ClaimantLatestUpdate();

class ClaimantResponseSteps {

  ClaimantRespond(claimRef) {
    claimantLatestUpdate.openClaimant(claimRef);
  }
}

module.exports = new ClaimantResponseSteps();
