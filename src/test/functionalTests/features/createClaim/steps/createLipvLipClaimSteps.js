const EligibilityCheck = require('../pages/eligibilityCheck');

const eligibilityCheck = new EligibilityCheck();

class CreateClaimSteps {

  async EligibilityCheckSteps() {
    await eligibilityCheck.open();
  }
}

module.exports = new CreateClaimSteps();
