const I = actor();

class LoginSteps {
  createClaimDraftViaTestingSupportE2e() {
    I.amOnPage('/testing-support/create-draft-claim');
    I.click('Create Draft Claim');
    I.seeInCurrentUrl('/claim/check-and-send'); // verify the URL contains a specific path
    I.click('Submit claim');
    I.seeInCurrentUrl('/claim/12345/confirmation'); // verify the URL contains a specific path
  }
}

module.exports = new LoginSteps();
