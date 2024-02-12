const I = actor();
const EligibilityCheck = require('../pages/eligibilityCheck');
const CreateClaim = require('../pages/createClaim');

const eligibilityCheck = new EligibilityCheck();
const createClaim = new CreateClaim();

const paths = {
  links: {
    resolving_this_dispute: '//a[.=\'Resolving this dispute\']',
    confirming_your_claim: '//a[.=\'Completing your claim\']',
    your_details: '//a[.=\'Your details\']',
    their_details: '//a[.=\'Their details\']',
    claim_amount : '//a[.=\'Claim amount\']',
    claim_details : '//a[.=\'Claim details\']',
    check_and_submit_your_claim : '//a[.=\'Check and submit your claim\']',
    opt_out_button : '//button[@name=\'opt-out-button\']',
  },
};
class CreateClaimSteps {

  async EligibilityCheckSteps() {
    await eligibilityCheck.open();
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

  async EligibilityCheckStepsForClaimCreation() {
    await eligibilityCheck.open();
    await eligibilityCheck.eligibilityClaimValue();
    await eligibilityCheck.eligibilitySingleDefendant();
    await eligibilityCheck.eligibilityDefendantAddress();
    await eligibilityCheck.eligibilityClaimType();
    await eligibilityCheck.eligibilityClaimantAddress();
    await eligibilityCheck.eligibilityTenancyDeposit();
    await eligibilityCheck.eligibilityGovtDept();
    await eligibilityCheck.eligibilityDefendantAge();
    await eligibilityCheck.eligibilityClaimantAge();
    await eligibilityCheck.eligibilityApplyForHWF();
    await eligibilityCheck.eligibilityHWFReference();
  }

  async CreateClaimCreation() {
    await createClaim.verifyLanguage();
    await createClaim.verifyDashboard();
    I.click(paths.links.resolving_this_dispute);
    await createClaim.verifyTryToResolveTheDispute();
    await this.verifyDashboardLoaded();
    I.click(paths.links.confirming_your_claim);
    await createClaim.verifyCompletingYourClaim();
    await this.verifyDashboardLoaded();
    I.click(paths.links.your_details);
    await createClaim.verifyAboutYouAndThisClaimForClaimant();
    await createClaim.verifyEnterYourDetails();
    await createClaim.inputEnterYourDetails(true);
    await createClaim.verifyDateOfBirth();
    await createClaim.inputDateOfBirth();
    await createClaim.verifyAndInputPhoneNumber();
    await this.verifyDashboardLoaded();
    I.click(paths.links.their_details);
    await createClaim.verifyAboutYouAndThisClaimForDefendant();
    await createClaim.verifyEnterDefendantsDetails();
    await createClaim.inputEnterYourDetails(false);
    await createClaim.verifyTheirEmailAddress();
    await createClaim.verifyTheirPhoneNumber();
    await this.verifyDashboardLoaded();
    I.click(paths.links.claim_amount);
    await createClaim.verifyClaimAmount();
    await createClaim.inputClaimAmount();
    await createClaim.verifyAndInputDoYouWantToClaimInterest();
    await createClaim.verifyAndInputHowDoYouWantToClaimInterest();
    await createClaim.verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim();
    await createClaim.verifyAndInputWhenWillYouClaimInterestFrom();
    await createClaim.verifyAndInputHelpWithFees();
    await createClaim.verifyClaimAmountSummary();
    await this.verifyDashboardLoaded();
    I.click(paths.links.claim_details);
    await createClaim.verifyAndInputClaimDetails();
    await createClaim.inputClaimDetailsTimeline();
    await createClaim.inputEvidenceList();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_claim);
    I.wait(3);
    await createClaim.verifyEqualityAndDiversity();
    I.click(paths.links.opt_out_button);
    await createClaim.verifyCheckYourAnswers();
    const caseReference = createClaim.verifyClaimSubmitted();
    console.log(caseReference);

  }

  async verifyDashboardLoaded() {
    I.waitForText('Submit', 3);
    I.see('Application complete', 'h2');
  }
}

module.exports = new CreateClaimSteps();
