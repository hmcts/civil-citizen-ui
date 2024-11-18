const ClaimantUpdate = require('../pages/claimantLiPResponse/claimantUpdate');
const Judgment = require('../pages/claimantLiPResponse/judgment');
const ViewDefendantResponse = require('../pages/claimantLiPResponse/viewDefendantResponse');
const YourResponse = require('../pages/claimantLiPResponse/yourResponse');
const CheckYourAnswers = require('../pages/claimantLiPResponse/checkYourAnswers');

const claimantUpdate = new ClaimantUpdate();
const judgment = new Judgment();
const viewDefendantResponse = new ViewDefendantResponse();
const yourResponse = new YourResponse();
const checkYourAnswers = new CheckYourAnswers();

class ClaimantResponseSteps {
  async RespondToClaimAsClaimant(claimRef, notification) {
    await claimantUpdate.respondToClaim(claimRef, notification);
  }

  async StartUploadDocs() {
    await claimantUpdate.startUploadDocs();
  }

  async ViewMediationDocs() {
    await claimantUpdate.viewMediationDocs();
  }

  async ClickAndViewDocs() {
    await claimantUpdate.clickAndViewDocs();
  }

  async verifyDefendantResponse(claimRef) {
    await viewDefendantResponse.verifyDefendantResponse(claimRef);
  }

  async settleTheClaim(isSettled, amount) {
    await yourResponse.settleTheClaim(isSettled, amount);
  }

  async isDefendantPaid(isPaid, amount) {
    await yourResponse.isDefendantPaid(isPaid, amount);
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

  async submitYourResponse() {
    await checkYourAnswers.submitYourResponse();
  }

  async verifyEditedEmailDetails() {
    await checkYourAnswers.verifyEditedEmailDetails();
  }

  async submitClaimantResponse() {
    await checkYourAnswers.submitClaimantResponse();
  }

  async verifyDefaultJudgment(claimRef) {
    await judgment.raiseDefaultJudgment(claimRef);
  }

  async verifyJudgmentByAdmission(claimRef) {
    await judgment.raiseJudgmentByAdmissions(claimRef);
  }
}

module.exports = new ClaimantResponseSteps();
