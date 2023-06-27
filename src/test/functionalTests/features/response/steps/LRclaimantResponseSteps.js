const ClaimantLatestUpdate = require("../pages/claimantResponse/ClaimantCaseDetails");
const ClaimantSelectEvent = require("../pages/claimantResponse/ClaimantCaseDetails");

const claimantLatestUpdate = new ClaimantLatestUpdate();
const claimantSelectEvent = new ClaimantSelectEvent();

class LRclaimantResponseSteps {

  ClaimantRespond(claimRef) {
    claimantLatestUpdate.openClaim(claimRef);
  }

  ClaimantNextSteps(eventName) {
    claimantSelectEvent.selectEvent(eventName);
  }
}

module.exports = new LRclaimantResponseSteps();
