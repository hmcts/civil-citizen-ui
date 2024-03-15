const ClaimantUpdate = require('../pages/claimantLiPResponse/claimantUpdate');
const ViewDefendantResponse = require('../pages/claimantLiPResponse/viewDefendantResponse');
const YourResponse = require('../pages/claimantLiPResponse/yourResponse');
const CheckYourAnswers = require('../pages/claimantLiPResponse/checkYourAnswers');

const claimantUpdate = new ClaimantUpdate();
const viewDefendantResponse = new ViewDefendantResponse();
const yourResponse = new YourResponse();
const checkYourAnswers = new CheckYourAnswers();

class ClaimantResponseSteps {
  async RespondToClaimAsClaimant(claimRef) {
    await claimantUpdate.respondToClaim(claimRef);
  }

  async StartUploadDocs(claimRef) {
    await claimantUpdate.startUploadDocs(claimRef);
  }

  async verifyDefendantResponse(claimRef) {
    await viewDefendantResponse.verifyDefendantResponse(claimRef);
  }

  async isDefendantPaid(isPaid) {
    await yourResponse.isDefendantPaid(isPaid);
  }

  async acceptOrRejectDefendantResponse(isPaid) {
    await yourResponse.acceptOrRejectDefendantResponse(isPaid);
  }

  async verifyMediationDetailsInCYA(claimRef) {
    await checkYourAnswers.verifyMediationDetailsInCYA(claimRef);
  }

  async verifyClaimantMediationDetailsInCYA(claimRef) {
    await checkYourAnswers.verifyClaimantMediationDetailsInCYA(claimRef);
  }

  async clickEmailChangeLink() {
    await checkYourAnswers.clickEmailChangeLink();
  }

  async verifyEditedEmailDetails() {
    await checkYourAnswers.verifyEditedEmailDetails();
  }

  async submitClaimantResponse() {
    await checkYourAnswers.submitClaimantResponse();
  }
}

module.exports = new ClaimantResponseSteps();
