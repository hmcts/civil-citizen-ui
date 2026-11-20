
const CancelUnissuedClaim = require('../../../citizenFeatures/cancelUnissuedClaim/pages/cancelUnissuedClaim');
const ConfirmationPage = require('../../../citizenFeatures/cancelUnissuedClaim/pages/confirmation');

const cancelUnissuedClaim = new CancelUnissuedClaim();
const confirmationPage = new ConfirmationPage();

const I = actor();

class CancelUnissuedClaimSteps {
  async ClickCancelUnissuedClaimLink(caseRef) {
    await I.amOnPage(`case/${caseRef}/cancel-unissued-claim`);
  }
  async VerifyPageContent() {
    await cancelUnissuedClaim.verifyPageContent();
  }

  async EnterCancelReason(reason) {
    await cancelUnissuedClaim.EnterCancelReason(reason);
  }

  async ClickCancelUnissuedClaim() {
    await cancelUnissuedClaim.cancelUnissuedClaim();
  }

  async ClickCancelButton() {
    await cancelUnissuedClaim.clickCancel();
  }

  async VerifyConfirmationPage() {
    await confirmationPage.verifyConfirmationPage();
  }

  async ClickGoToYourAccount() {
    await confirmationPage.clickGoToYourAccount();
  }
}

module.exports = new CancelUnissuedClaimSteps();
