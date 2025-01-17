const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const I = actor();

const newDate = new Date(new Date().setMonth(new Date().getMonth()+2));
const month = newDate.getMonth() + 1;
const year = newDate.getFullYear();

class RespondentResponse {

  agreeToOrder(option, selectedApplicationType, claimId, appId) {
    I.amOnPage(`case/${claimId}/response/general-application/${appId}/agree-to-order`);
    I.see(selectedApplicationType);
    I.see('The other parties have said that you\'ve agreed to the order they\'ve requested. Is this correct?');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  respondentAgreement(claimId, appId, selectedApplicationType, option) {
    I.amOnPage(`case/${claimId}/response/general-application/${appId}/respondent-agreement`);
    I.see(selectedApplicationType);
    I.see('Do you agree that the court should make the order that the other parties have requested?');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  acceptDefendantOffer(claimId, appId, option, planType) {
    I.amOnPage(`case/${claimId}/response/general-application/${appId}/accept-defendant-offer`);
    I.click(option);
    if (option === 'No' && planType === 'instalments') {
      I.click('I\'ll accept certain instalments per month');
      I.fillField('#amountPerMonth', 100);
      I.fillField('#reasonProposedInstalment', 'no savings');
    }
    clickButton(buttonType.CONTINUE);
  }

  wantToUploadDocuments(claimId, appId, option) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/want-to-upload-document`);
    I.see('Do you want to upload documents to support your response?');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  hearingPreference(claimId, appId) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/hearing-preference`);
    I.see('Application hearing preferences', 'h1');
    clickButton(buttonType.CONTINUE);
  }

  hearingArrangement(claimId, appId, typeOfHearing) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/hearing-arrangement`);
    I.see('What type of hearing would you prefer?');
    I.click(typeOfHearing);
    I.fillField('#reasonForPreferredHearingType', 'due to personal issues');
    clickButton(buttonType.CONTINUE);
  }

  hearingContactDetails(claimId, appId) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/hearing-contact-details`);
    I.see('Preferred telephone number');
    I.fillField('#telephoneNumber', '07555555555');
    I.see('Preferred email address');
    I.fillField('#emailAddress', 'civilmoneyclaimsdemo@gmail.com');
    clickButton(buttonType.CONTINUE);
  }

  unavailableDates(claimId, appId) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/unavailability-confirmation`);
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months?');
    I.click('Yes');
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/unavailable-dates`);
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months?');
    I.click('#items-0-single-date');
    I.fillField('input[name="items[0][single][start][day]"]', 1);
    I.fillField('input[name="items[0][single][start][month]"]', month);
    I.fillField('input[name="items[0][single][start][year]"]', year);
    clickButton(buttonType.CONTINUE);
  }

  hearingSupport(claimId, appId) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/hearing-support`);
    I.see('Adjustments or support to attend a hearing');
    clickButton(buttonType.CONTINUE);
  }

  submitApplication(claimId, appId) {
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/check-and-send`);
    I.checkOption('#signed');
    I.fillField('#name', 'applicant');
    clickButton(buttonType.SUBMIT);
  }

  confirmationPage(claimId, appId) {
    I.seeInCurrentUrl(`/case/${claimId}/response/general-application/${appId}/confirmation`);
    I.see('You\'ve responded to the application');
  }

}

module.exports = new RespondentResponse();
