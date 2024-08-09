const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {responseTaskListItems, checkTaskList, taskListStatus} = require('../../commons/claimTaskList');
const I = actor();

class Response {
  start(claimId) {
    I.amOnPage(`/case/${claimId}/response/task-list`);
  }

  confirmYourDetails() {
    I.click(responseTaskListItems.CONFIRM_YOUR_DETAILS, checkTaskList(responseTaskListItems.CONFIRM_YOUR_DETAILS, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/your-details');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    //your-phone
    I.seeInCurrentUrl('/response/your-phone');
    I.fillField('#telephoneNumber', '0123456789');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.CONFIRM_YOUR_DETAILS, checkTaskList(responseTaskListItems.CONFIRM_YOUR_DETAILS, taskListStatus.COMPLETE));
  }

  viewYourOptionsBeforeResponseDeadline() {
    I.click(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, checkTaskList(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/new-response-deadline');
    //TODO ADD THE FIELDS HERE
    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, checkTaskList(responseTaskListItems.VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE, taskListStatus.COMPLETE));
  }

  chooseResponse(responseType) {
    I.click(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/response-type');
    I.checkOption(`#${responseType}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.COMPLETE));
  }

  decideHowYouWillPay(paymentType) {
    I.click(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, checkTaskList(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/full-admission/payment-option');
    I.checkOption(`#${paymentType}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, checkTaskList(responseTaskListItems.DECIDE_HOW_YOU_WILL_PAY, taskListStatus.COMPLETE));
  }

  checkAndSubmitYourResponse() {
    I.click(responseTaskListItems.CHECK_AND_SUBMIT_YOUR_RESPONSE, checkTaskList(responseTaskListItems.CHECK_AND_SUBMIT_YOUR_RESPONSE, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/response/check-and-send');
    I.fillField('#signerName', 'Full name');
    I.fillField('#signerRole', 'Job title');
    I.checkOption('#signed');
    clickButton(buttonType.SUBMIT_RESPONSE);
    //TODO ADD MOCK FOR /cases/response/deadline
  }
}

module.exports = new Response();
