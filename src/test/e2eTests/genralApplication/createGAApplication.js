const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {resetScenarios} = require('../../functionalTests/specClaimHelpers/api/wiremock');
const I = actor();

class CreateGAApplication {

  start(claimId) {
    I.amOnPage(`/dashboard/${claimId}/claimantNewDesign`);
    I.click('Contact the court to request a change to my case');
  }

  selectApplicationType(applicationType) {
    I.click(`${applicationType}`);
    clickButton(buttonType.CONTINUE);
  }

  selectAgreementFromOtherParty(option) {
    I.waitForContent('Have the other parties agreed to this application?', 'h1');
    I.see('If you\'ll be selecting multiple applications, this answer will apply to all of them.');
    I.see('Yes');
    I.see('No');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  applicationCosts(claimId, selectedApplication, applicationFee) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/application-costs`);
    I.see('Make an application');
    I.see(selectedApplication);
    I.see(applicationFee);
    clickButton(buttonType.START_NOW);
  }

  claimCosts(claimId, option) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/claim-application-cost`);
    I.see('Do you want to ask for your costs back?');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  orderJudge(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/order-judge`);
    I.see('What order do you want the judge to make?');
    I.fillField('#text', 'no mistake done by me to dismiss the claim');
    clickButton(buttonType.CONTINUE);
  }

  requestingReason(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/requesting-reason`);
    I.see('Why are you requesting this order?');
    I.fillField('#text', 'dismiss the order');
    clickButton(buttonType.CONTINUE);
  }

  addAnotherApp(claimId, option) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/add-another-application`);
    I.see('Do you want to add another application?');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  wantToUploadDocs(claimId, option) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/want-to-upload-documents`);
    I.see('Do you want to upload documents to support your application?');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  hearingArrangementsInfo(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/hearing-arrangements-guidance`);
    I.see('Application hearing arrangements', 'h1.govuk-heading-l');
    clickButton(buttonType.CONTINUE);
  }

  hearingArrangements(claimId, typeOfHearing) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/hearing-arrangement`);
    I.see('What type of hearing would you prefer?');
    I.click(typeOfHearing);
    I.fillField('#reasonForPreferredHearingType', 'due to personal issues');
    clickButton(buttonType.CONTINUE);
  }

  hearingContactDetails(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/hearing-contact-details`);
    I.see('Preferred telephone number');
    I.fillField('#telephoneNumber', '07555555555');
    I.see('Preferred email address');
    I.fillField('#emailAddress', 'civilmoneyclaimsdemo@gmail.com');
    clickButton(buttonType.CONTINUE);
  }

  unavailableDates(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/unavailable-dates`);
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months (optional)?');
    clickButton(buttonType.CONTINUE);
  }

  hearingSupport(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/hearing-support`);
    I.see('Adjustments or support to attend a hearing');
    clickButton(buttonType.CONTINUE);
  }

  payYourApplicationFee(claimId, fee) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/paying-for-application`);
    I.see('Application fee to pay:');
    I.see(`£${fee}`);
    clickButton(buttonType.CONTINUE);
  }

  checkAndSend(claimId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/check-and-send`);
    I.checkOption('#signed');
    I.fillField('#name', 'applicant');
    clickButton(buttonType.SUBMIT);
  }

  submitConfirmation(claimId, fee) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/submit-general-application-confirmation`);
    I.see('Application created', 'h1');
    I.see(`Your application has been saved, but you need to pay the application fee of £${fee}`);
    clickButton('Pay application fee');
  }

  selectFeeType(claimId) {
    I.seeInCurrentUrl(`/case/${claimId}/general-application/apply-help-fee-selection`);
    I.click('No');
    clickButton('Continue');
  }

  verifyPaymentSuccessfullPage(claimId, AppId) {
    I.seeInCurrentUrl(`/case/${claimId}/general-application/${AppId}/payment-successful`);
    I.see('Your payment was\n' +
      'successful');

  }

  async resetWiremockScenario() {
    await resetScenarios();
  }
}

module.exports = new CreateGAApplication();
