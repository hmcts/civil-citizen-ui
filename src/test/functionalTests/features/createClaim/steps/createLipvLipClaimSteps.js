const I = actor();
const EligibilityCheck = require('../pages/eligibilityCheck');
const CreateClaim = require('./../pages/createClaim');
const { language, userPartyType } = require('./../../common/constants');

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

  async CreateClaimCreation(addInterest, claimantPartyType = userPartyType.INDIVIDUAL, defendantPartyType = userPartyType.INDIVIDUAL, selectedLanguage = language.ENGLISH) {
    await createClaim.verifyAndChooseLanguage(selectedLanguage);
    await createClaim.verifyTaskListPage(selectedLanguage);
    await this.resolvingThisDispute(selectedLanguage);
    await this.prepareYourClaim(claimantPartyType, defendantPartyType, addInterest, selectedLanguage);
    await this.Submit(addInterest, selectedLanguage);
    const caseReference = await createClaim.verifyClaimSubmitted();
    console.log('The created Case Reference : ', caseReference);
    return caseReference;
  }

  async resolvingThisDispute(selectedLang) {
    I.click(paths.links.resolving_this_dispute);
    await createClaim.verifyTryToResolveTheDispute(selectedLang);
    await this.waitForTaskListPage(selectedLang);
  }

  async prepareYourClaim(claimantPartyType, defendantPartyType, addInterest = false, selectedLang) {
    await this.confirmYourDetails(selectedLang);
    await this.yourDetails(selectedLang, claimantPartyType);
    await this.theirDetails(selectedLang, defendantPartyType);
    await this.claimAmount(addInterest, selectedLang);
    await this.claimDetails(selectedLang);
    await this.Submit(addInterest, selectedLang);
  }

  async completeYourClaim(selectedLang) {
    I.click(paths.links.confirming_your_claim);
    await createClaim.verifyCompletingYourClaim(selectedLang);
    await this.waitForTaskListPage(selectedLang);
  }

  //Claimant Details
  async yourDetails(selectedLang, claimantPartyType) {
    const isAddingClaimantDetails = true;
    I.click(paths.links.your_details);
    await createClaim.verifyAboutYouAndThisClaimForClaimant(selectedLang, claimantPartyType);
    await createClaim.verifyEnterYourDetails(selectedLang, claimantPartyType);
    await createClaim.inputEnterYourDetails(isAddingClaimantDetails, selectedLang, claimantPartyType);
    await createClaim.verifyDateOfBirth(selectedLang, claimantPartyType);
    await createClaim.inputDateOfBirth(selectedLang, claimantPartyType);
    await createClaim.verifyAndInputPhoneNumber(selectedLang, claimantPartyType);
    await this.waitForTaskListPage(selectedLang);
  }

  //Defendant Details
  async theirDetails(selectedLang, defendantPartyType) {
    const isAddingClaimantDetails = false;
    I.click(paths.links.their_details);
    await createClaim.verifyAboutYouAndThisClaimForDefendant(selectedLang, defendantPartyType);
    await createClaim.verifyEnterDefendantsDetails(selectedLang, defendantPartyType));
    await createClaim.inputEnterYourDetails(isAddingClaimantDetails, selectedLang, defendantPartyType);
    await createClaim.verifyTheirEmailAddress(selectedLang, defendantPartyType));
    await createClaim.verifyTheirPhoneNumber(selectedLang, defendantPartyType));
    await this.waitForTaskListPage(selectedLang);
  }

  async claimAmount(addInterest, selectedLang) {
    I.click(paths.links.claim_amount);
    await createClaim.verifyContentOnClaimAmountScreen(selectedLang);
    await createClaim.inputClaimAmount();
    await createClaim.verifyAndInputDoYouWantToClaimInterest(addInterest, selectedLang);
    if (addInterest === true) {
      await createClaim.verifyAndInputHowDoYouWantToClaimInterest(selectedLang);
      await createClaim.verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim(selectedLang);
      await createClaim.verifyAndInputWhenWillYouClaimInterestFrom(selectedLang);
    }
    await createClaim.verifyAndInputHelpWithFees(selectedLang);
    await createClaim.verifyClaimAmountSummary(addInterest, selectedLang);
    await this.waitForTaskListPage(selectedLang);
  }

  async claimDetails(selectedLang) {
    I.click(paths.links.claim_details);
    await createClaim.verifyAndInputClaimDetails(selectedLang);
    await createClaim.verifyClaimDetailsTimeline(selectedLang);
    await createClaim.inputClaimDetailsTimeline();
    await createClaim.inputEvidenceList(selectedLang);
    await this.waitForTaskListPage(selectedLang);
  }

  async Submit(addInterest, selectedLang) {
    I.click(paths.links.check_and_submit_your_claim);
    await createClaim.rerouteFromEqualityAndDiversity(paths.links.check_and_submit_your_claim);
    await createClaim.verifyCheckYourAnswers(addInterest, selectedLang);
  }

  async payClaimFee() {
    await I.click(paths.links.pay_claim_fee);
    await createClaim.verifyAndInputPayYourClaimFee();
    await createClaim.verifyAndInputCardDetails();
    await createClaim.verifyConfirmYourPayment();
    await createClaim.verifyYourPaymentWasSuccessfull();
    await createClaim.signOut();
  }

  async waitForTaskListPage(selectedLang = language.ENGLISH) {
    I.waitForText('Submit', 3);
    if (selectedLang == language.ENGLISH) {
      I.see('Application complete', 'h2');
    }
  }
}

module.exports = new CreateClaimSteps();
