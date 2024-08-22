const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {responseTaskListItems, checkTaskList, taskListStatus} = require('../../commons/claimTaskList');
const {responseType, paymentType} = require('../../commons/responseVariables');
const {yesAndNoCheckBoxOptionValue, speakLanguage, documentLanguage, supportRequired, howOftenYouMakePayments} = require('../../commons/eligibleVariables');
const {seeInTitle} = require('../../commons/seeInTitle');
const {checkDateFields} = require('../../commons/checkDateFields');
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

  decideHowYouWillPay(typeOfPayment) {
    I.click(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, checkTaskList(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/full-admission/payment-option');
    seeInTitle('Payment option');

    I.checkOption(`#${typeOfPayment}`);
    I.seeElement('//label[contains(., "Immediately")]');
    I.seeElement('//label[contains(., "By a set date")]');
    I.seeElement('//label[contains(., "I\'ll suggest a repayment plan")]');

    clickButton(buttonType.SAVE_AND_CONTINUE);

    if(typeOfPayment === paymentType.BY_A_SET_DATE){
      this.paymentDate();
    }

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

  paymentDate(){
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    I.seeInCurrentUrl('/full-admission/payment-date');
    I.seeInTitle('Your money claims account - Money Claims');

    I.see('What date will you pay on?', 'h1.govuk-fieldset__heading');
    I.see('For example, 22 9 2024', 'div.govuk-hint');

    I.see('Day', 'label.govuk-label');
    I.fillField('#day', futureDate.getDate());
    I.see('Month', 'label.govuk-label');
    I.fillField('#month', futureDate.getMonth() + 1);
    I.see('Year', 'label.govuk-label');
    I.fillField('#year', futureDate.getFullYear());
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  shareYourFinancialDetails() {
    I.click(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, checkTaskList(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/statement-of-means/intro');
    seeInTitle('Your financial details');
    I.see('Send Mr. Jan Clark your financial details', 'h1.govuk-heading-l');
    I.see('\'You need to send \' Mr. Jan Clark your company or organisation\'s most recent statement of accounts.', 'p.govuk-body');
    I.see('They\'ll review your accounts and can reject your suggested repayment plan if they believe you can pay sooner.', 'p.govuk-body');
    I.see('If they reject your plan, the court will make a new plan based on your financial details.', 'p.govuk-body');
    I.seeElement('a', 'Get Mr. Jan Clark \'s contact details.');

    clickButton(buttonType.CONTINUE);

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, checkTaskList(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, taskListStatus.COMPLETE));
  }

  yourRepaymentPlan(){
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    I.click(responseTaskListItems.YOUR_REPAYMENT_PLAN, checkTaskList(responseTaskListItems.YOUR_REPAYMENT_PLAN, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/full-admission/payment-plan');
    seeInTitle('Your repayment plan');
    I.see('Your repayment plan', 'h1.govuk-fieldset__heading');
    I.see('The total amount claimed is £1000. This includes the claim fee and any interest.', 'p.govuk-body-m');

    I.see('Regular payments of:', 'p.govuk-body-m');
    I.see('For example, £200', 'div.govuk-hint');
    I.fillField('#paymentAmount', '500');

    I.see('How often you\'ll make these payments?', 'legend.govuk-fieldset__legend');
    I.checkOption(`#${howOftenYouMakePayments.EACH_WEEK}`);

    I.waitForElement('#two-months_schedule', 1); // wait for 1 second
    I.see('2 weeks', '#two-weeks_schedule');

    I.see('When will you make the first payment?','legend.govuk-fieldset__legend');
    I.see('For example, 22/09/2024','div.govuk-hint');
    checkDateFields(futureDate);

    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.YOUR_REPAYMENT_PLAN, checkTaskList(responseTaskListItems.YOUR_REPAYMENT_PLAN, taskListStatus.COMPLETE));
  }

  checkAndSubmitYourResponse(withDirectionsQuestionnaire) {
    I.click(responseTaskListItems.CHECK_AND_SUBMIT_YOUR_RESPONSE, checkTaskList(responseTaskListItems.CHECK_AND_SUBMIT_YOUR_RESPONSE, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/check-and-send');
    seeInTitle('Check your answers');
    I.see('Statement of truth', 'h2.govuk-heading-m');
    I.see('The information on this page forms your response. You can see it on the response form after you submit.', 'p.govuk-body');
    I.see('When you\'re satisfied that your answers are accurate, you should tick to "sign" this statement of truth on the form', 'p.govuk-body');
    I.see('You must hold a senior position in your organisation to sign the statement of truth.', 'p.govuk-body');
    I.see('Types of senior position', '.govuk-details__summary-text');

    I.see('Full name', 'label.govuk-label');
    I.see('Job title', 'label.govuk-label');
    I.fillField('#signerName', 'Full name');
    I.fillField('#signerRole', 'Job title');

    I.see('I believe that the facts stated in this response are true.', 'label.govuk-label');
    I.see('I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.', 'label.govuk-label');
    I.checkOption('#signed');
    if (withDirectionsQuestionnaire){
      I.checkOption('#directionsQuestionnaireSigned');
    }
    clickButton(buttonType.SUBMIT_RESPONSE);
    I.seeInCurrentUrl('/response/confirmation');
  }
}

module.exports = new Response();
