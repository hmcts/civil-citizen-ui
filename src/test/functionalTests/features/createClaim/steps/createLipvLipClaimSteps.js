const EligibilityCheck = require('../pages/eligibilityCheck');

const eligibilityCheck = new EligibilityCheck();

class CreateClaimSteps {

  async EligibilityCheckSteps() {
    await eligibilityCheck.open();
    await eligibilityCheck.eligibilityClaimValueValidations();
    await eligibilityCheck.eligibilityClaimValue();
    await eligibilityCheck.eligibilitySingleDefendantValidations();
    await eligibilityCheck.eligibilitySingleDefendant();
    await eligibilityCheck.eligibilityDefendantAddressValidations();
    await eligibilityCheck.eligibilityDefendantAddress();
    await eligibilityCheck.eligibilityClaimTypeValidations();
    await eligibilityCheck.eligibilityClaimType();
    await eligibilityCheck.eligibilityClaimantAddressValidations();
    await eligibilityCheck.eligibilityClaimantAddress();
    await eligibilityCheck.eligibilityTenancyDepositValidations();
    await eligibilityCheck.eligibilityTenancyDeposit();
    await eligibilityCheck.eligibilityGovtDeptValidations();
    await eligibilityCheck.eligibilityGovtDept();
    await eligibilityCheck.eligibilityDefendantAgeValidations();
    await eligibilityCheck.eligibilityDefendantAge();
    await eligibilityCheck.eligibilityClaimantAgeValidations();
    await eligibilityCheck.eligibilityClaimantAge();
    await eligibilityCheck.eligibilityApplyForHWF();
    await eligibilityCheck.eligibilityHWFReferenceValidations();
    await eligibilityCheck.eligibilityHWFReference();
  }
}

module.exports = new CreateClaimSteps();
