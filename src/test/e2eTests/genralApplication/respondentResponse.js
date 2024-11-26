const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const I = actor();

class RespondentResponse {

  agreeToOrder(option, selectedApplicationType, claimId, appId) {
    I.amOnPage(`case/${claimId}/response/general-application/${appId}/agree-to-order`);
    I.see(selectedApplicationType);
    I.see('The other parties have said that you\'ve agreed to the order they\'ve requested. Is this correct?');
    I.click(option);
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
    I.seeInCurrentUrl(`case/${claimId}/response/general-application/${appId}/unavailable-dates`);
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months (optional)?');
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
