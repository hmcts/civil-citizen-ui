const I = actor();

class LoginSteps {
  createClaimDraftViaTestingSupportE2e() {
    I.amOnPage('/testing-support/create-draft-claim');
    I.click('Create Draft Claim');
    I.seeInCurrentUrl('/claim/check-and-send');
    I.click('Submit claim');
    I.seeInCurrentUrl('/claim/1111222233334444/confirmation');
  }
}

module.exports = new LoginSteps();
