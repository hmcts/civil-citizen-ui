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
    pay_claim_fee : 'Pay claim fee',
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

  async CreateClaimCreation(claimInterestFlag) {
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
    await createClaim.verifyAndInputDoYouWantToClaimInterest(claimInterestFlag);
    if (claimInterestFlag === true) {
      await createClaim.verifyAndInputHowDoYouWantToClaimInterest();
      await createClaim.verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim();
      await createClaim.verifyAndInputWhenWillYouClaimInterestFrom();
    }
    await createClaim.verifyAndInputHelpWithFees();
    await createClaim.verifyClaimAmountSummary(claimInterestFlag);
    await this.verifyDashboardLoaded();
    I.click(paths.links.claim_details);
    await createClaim.verifyAndInputClaimDetails();
    await createClaim.inputClaimDetailsTimeline();
    await createClaim.inputEvidenceList();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_claim);
    await createClaim.rerouteFromEqualityAndDiversity(paths.links.check_and_submit_your_claim);
    await createClaim.verifyCheckYourAnswers(claimInterestFlag);
    const caseReference = await createClaim.verifyClaimSubmitted();
    console.log('The created Case Reference : ', caseReference);
    return caseReference;
  }

  async clickPayClaimFee() {
    await I.click(paths.links.pay_claim_fee);
  }

  async verifyAndPayClaimFee(claimAmount, claimFee) {
    await createClaim.verifyAndInputPayYourClaimFee(claimAmount, claimFee);
    await createClaim.verifyAndInputCardDetails();
    await createClaim.verifyConfirmYourPayment();
    await createClaim.verifyYourPaymentWasSuccessfull();
  }

  async verifyDashboardLoaded() {
    I.waitForContent('Submit', 3);
    I.see('Application complete', 'h2');
  }

  async createClaimDraftViaTestingSupport() {
    await I.waitForVisible('#navigation', 60);
    await I.amOnPage('/testing-support/create-draft-claim');
    await I.click('Create Draft Claim');
    await I.amOnPage('/claim/task-list');
    await I.waitForContent('Prepare your claim', 60);
  }

  async addSoleTraderClaimant() {
    await I.amOnPage('/claim/claimant-party-type-selection');
    await createClaim.fillSoleTraderClaimantDetails();
  }

  async addSoleTraderDefendant() {
    await I.amOnPage('/claim/defendant-party-type-selection');
    await createClaim.fillSoleTraderDefendantDetails();
  }

  async addOrgClaimant() {  
    await I.amOnPage('/claim/claimant-party-type-selection');
    await createClaim.fillOrgClaimantDetails();
  }

  async addOrgDefendant() {
    await I.amOnPage('/claim/defendant-party-type-selection');
    await createClaim.fillOrgDefendantDetails();
  }

  async addCompanyClaimant() {
    await I.amOnPage('/claim/claimant-party-type-selection');
    await createClaim.fillCompanyClaimantDetails();
  }

  async addCompanyDefendant() {
    await I.amOnPage('/claim/defendant-party-type-selection');
    await createClaim.fillCompanyDefendantDetails();
  }

  async updateClaimAmount(totalAmount, claimInterestFlag, standardInterest, selectHWF) {
    await I.amOnPage('/claim/amount');
    await createClaim.addClaimAmount(totalAmount, claimInterestFlag, standardInterest, selectHWF);
  }

  async checkAndSubmit(selectedHWF, claimantPartyType = 'Individual') {
    await I.amOnPage('/claim/task-list');
    let caseRef = await createClaim.checkAndSubmit(selectedHWF, claimantPartyType);
    caseRef = caseRef.replace(/-/g, '');
    console.log('The value of the claim reference : ', caseRef);
    return caseRef;
  }
}

module.exports = new CreateClaimSteps();
