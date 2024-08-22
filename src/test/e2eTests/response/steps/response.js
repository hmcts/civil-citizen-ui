const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {responseTaskListItems, checkTaskList, taskListStatus} = require('../../commons/claimTaskList');
const {responseType} = require('../../commons/responseVariables');
const {yesAndNoCheckBoxOptionValue, speakLanguage, documentLanguage, supportRequired} = require('../../commons/eligibleVariables');
const {seeInTitle} = require('../../commons/seeInTitle');
const I = actor();

class Response {
  start(claimId) {
    I.amOnPage(`/case/${claimId}/response/task-list`);
  }

  confirmYourDetails() {
    I.click(responseTaskListItems.CONFIRM_YOUR_DETAILS, checkTaskList(responseTaskListItems.CONFIRM_YOUR_DETAILS, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/your-details');
    seeInTitle('Company details');
    I.see('Confirm your details', 'h1.govuk-heading-l');
    I.see('Your name and address were provided by the person, business or organisation claiming from you (the claimant).', 'p.govuk-body');

    I.see('Organisation name', 'h2.govuk-heading-m');
    I.see('Version 1', 'p.govuk-label');
    I.see('Contact person (optional)', 'label.govuk-label');
    I.seeElement('input.govuk-input#contactPerson');

    I.see('Company address', 'h2.govuk-heading-m');
    I.see('If your address is not correct you can change it here.Any changes will be shared with the claimant when you submit your response.', 'p.govuk-body');
    I.see('Building and street', 'label.govuk-label');
    I.seeElement('input[id="primaryAddress[addressLine1]"]');
    I.seeElement('input[id="primaryAddress[addressLine2]"]');
    I.seeElement('input[id="primaryAddress[addressLine3]"]');

    I.see('Town or city', 'label.govuk-label');
    I.seeElement('input[id="primaryAddress[city]"]');

    I.see('Postcode', 'label.govuk-label');
    I.seeElement('input[id="primaryAddress[postCode]"]');

    I.see('Correspondence address', 'h2.govuk-heading-m');
    I.see('Would you like correspondence sent to a different address?', 'legend.govuk-fieldset__legend');
    I.seeElement('input[id="postToThisAddress"]');
    I.seeElement('input[id="postToThisAddress-2"]');

    clickButton(buttonType.SAVE_AND_CONTINUE);

    //your-phone
    I.seeInCurrentUrl('/response/your-phone');
    seeInTitle('Your phone number');
    I.see('Enter a phone number (optional)', 'h1.govuk-heading-l');
    I.see('We will only call you if we need more information about this claim.', 'p.govuk-body');
    I.see('We\'ll give your phone number to the person, business, or organisation claiming from you, or to their legal representative, if they have one.', 'p.govuk-body');
    I.see('Use numbers only, for example, 01632960001.', 'div.govuk-hint');
    I.seeElement('input[id="telephoneNumber"]');
    I.fillField('#telephoneNumber', '0123456789');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.CONFIRM_YOUR_DETAILS, checkTaskList(responseTaskListItems.CONFIRM_YOUR_DETAILS, taskListStatus.COMPLETE));
  }

  viewYourOptionsBeforeResponseDeadline() {
    I.click(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, checkTaskList(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/new-response-deadline');
    //TODO ADD THE FIELDS HERE
    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, checkTaskList(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, taskListStatus.COMPLETE));
  }

  chooseResponseAdmitAllOfTheClaim() {
    I.click(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/response-type');
    seeInTitle('Your claim response');
    I.see('How do you respond to the claim?', 'h1.govuk-heading-l');
    I.see('Find out what each response means', '.govuk-details__summary-text');

    I.checkOption(`#${responseType.I_ADMIT_ALL_OF_THE_CLAIM}`);
    I.seeElement('//span[contains(., "I admit all of the claim")]');
    I.see('You agree you owe the full amount claimed.', 'div.govuk-hint');

    I.seeElement('//span[contains(., "I admit part of the claim")]');
    I.see('You agree you owe some money but not the full amount claimed.', 'div.govuk-hint');

    I.seeElement('//span[contains(., "I reject all of the claim")]');
    I.see('You\'ve either paid what you believe you owe or you reject the claim.', 'div.govuk-hint');

    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.COMPLETE));
  }

  decideHowYouWillPay(paymentType) {
    I.click(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, checkTaskList(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/full-admission/payment-option');
    seeInTitle('Payment option');

    I.checkOption(`#${paymentType}`);
    I.seeElement('//label[contains(., "Immediately")]');
    I.seeElement('//label[contains(., "By a set date")]');
    I.seeElement('//label[contains(., "I\'ll suggest a repayment plan")]');

    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, checkTaskList(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, taskListStatus.COMPLETE));
  }

  chooseResponseRejectAllOfClaim(rejectOption){
    I.click(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/response-type');
    I.checkOption(`#${responseType.I_REJECT_ALL_OF_THE_CLAIM}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/reject-all-of-claim');
    I.checkOption(`#${rejectOption}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.COMPLETE));
  }

  tellUsHowMuchYouHavePaid(){
    I.click(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, checkTaskList(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/full-rejection/how-much-have-you-paid');
    I.fillField('#amount', '1000');
    I.fillField('#day', '01');
    I.fillField('#month', '01');
    I.fillField('#year', '2024');
    I.fillField('textarea[id="text"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, checkTaskList(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, taskListStatus.COMPLETE));
  }

  tellUsWhyYouDisagreeWithTheClaim(){
    I.click(responseTaskListItems.TELL_US_WHY_YOU_DISAGREE_WITH_THE_CLAIM, checkTaskList(responseTaskListItems.TELL_US_WHY_YOU_DISAGREE_WITH_THE_CLAIM, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/your-defence');
    I.fillField('textarea[id="text"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/timeline');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/evidence');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.TELL_US_WHY_YOU_DISAGREE_WITH_THE_CLAIM, checkTaskList(responseTaskListItems.TELL_US_WHY_YOU_DISAGREE_WITH_THE_CLAIM, taskListStatus.COMPLETE));
  }

  freeTelephoneMediation(){
    I.click(responseTaskListItems.FREE_TELEPHONE_MEDIATION, checkTaskList(responseTaskListItems.FREE_TELEPHONE_MEDIATION, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/mediation/free-telephone-mediation');
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl('/mediation/can-we-use-company');
    I.fillField('#mediationContactPerson', 'TEST');
    I.fillField('#mediationPhoneNumber', '0123456789');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.FREE_TELEPHONE_MEDIATION, checkTaskList(responseTaskListItems.FREE_TELEPHONE_MEDIATION, taskListStatus.COMPLETE));
  }

  giveUsDetailsInCaseThereIsAHearing(){
    I.click(responseTaskListItems.GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING, checkTaskList(responseTaskListItems.GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/directions-questionnaire/determination-without-hearing');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    I.fillField('textarea[id="reasonForHearing"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/expert');
    clickButton(buttonType.CONTINUE_WITHOUT_AN_EXPERT);

    I.seeInCurrentUrl('/directions-questionnaire/give-evidence-yourself');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/other-witnesses');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/cant-attend-hearing-in-next-12-months');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/phone-or-video-hearing');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/vulnerability');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/support-required');
    I.checkOption(`#${supportRequired.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/court-location');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/welsh-language');
    I.checkOption(`#${speakLanguage.ENGLISH}`);
    I.checkOption(`#${documentLanguage.ENGLISH}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.see(responseTaskListItems.GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING, checkTaskList(responseTaskListItems.GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING, taskListStatus.COMPLETE));
  }

  checkAndSubmitYourResponse(withDirectionsQuestionnaire) {
    I.click(responseTaskListItems.CHECK_AND_SUBMIT_YOUR_RESPONSE, checkTaskList(responseTaskListItems.CHECK_AND_SUBMIT_YOUR_RESPONSE, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/check-and-send');
    seeInTitle('Check your answers');
    I.see('Statement of truth', 'h2.govuk-heading-m');
    I.see('Statement of truth', 'h2.govuk-heading-m');
    I.see('Statement of truth', 'h2.govuk-heading-m');
    I.see('Statement of truth', 'h2.govuk-heading-m');
    I.fillField('#signerName', 'Full name');
    I.fillField('#signerRole', 'Job title');
    I.checkOption('#signed');
    if (withDirectionsQuestionnaire){
      I.checkOption('#directionsQuestionnaireSigned');
    }
    clickButton(buttonType.SUBMIT_RESPONSE);
    I.seeInCurrentUrl('/response/confirmation');
  }
}

module.exports = new Response();
