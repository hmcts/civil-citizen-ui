const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {taskListItems, taskListStatus, checkTaskList} = require('../../commons/claimTaskList');
const {claimantPartyType, defendantPartyType, yesAndNoCheckBoxOptionValue,
  interestType, sameRateInterestType, interestClaimFrom} = require('../../commons/eligibleVariables');

const I = actor();

class Response {
  start(optionValue) {
    I.amOnPage('/claim/bilingual-language-preference');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/claim/task-list');
  }

  considerOtherOptions() {
    I.click(taskListItems.RESOLVING_THIS_DISPUTE, checkTaskList(taskListItems.RESOLVING_THIS_DISPUTE, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/claim/resolving-this-dispute');
    clickButton(buttonType.I_CONFIRM_I_HAVE_READ_THIS);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.RESOLVING_THIS_DISPUTE, checkTaskList(taskListItems.RESOLVING_THIS_DISPUTE, taskListStatus.COMPLETE));
  }

  completingYourClaim() {
    I.click(taskListItems.COMPLETING_YOUR_CLAIM, checkTaskList(taskListItems.COMPLETING_YOUR_CLAIM, taskListStatus.INCOMPLETE)); // Ensure the element exists
    I.seeInCurrentUrl('/claim/completing-claim');
    clickButton(buttonType.I_CONFIRM_I_HAVE_READ_THIS);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.COMPLETING_YOUR_CLAIM, checkTaskList(taskListItems.COMPLETING_YOUR_CLAIM, taskListStatus.COMPLETE));
  }

  yourDetails() {
    I.click(taskListItems.YOUR_DETAILS, checkTaskList(taskListItems.YOUR_DETAILS, taskListStatus.INCOMPLETE)); // Ensure the element exists

    //claimant-party-type-selection as An individual
    I.seeInCurrentUrl('/claim/claimant-party-type-selection');
    I.checkOption(`#${claimantPartyType.AN_INDIVIDUAL}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    //claimant-individual-details
    I.seeInCurrentUrl('/claim/claimant-individual-details');
    I.fillField('#title', 'title');
    I.fillField('#firstName', 'firstName');
    I.fillField('#lastName', 'title');
    I.click('Enter address manually');
    I.fillField('input[id="primaryAddress[addressLine1]"]', 'addressLine1');
    I.fillField('input[id="primaryAddress[city]"]', 'city');
    I.fillField('input[id="primaryAddress[postCode]"]', 'W1J 7NT');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    //claimant-dob
    I.seeInCurrentUrl('/claim/claimant-dob');
    I.fillField('#day', '01');
    I.fillField('#month', '01');
    I.fillField('#year', '1984');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    //claimant-phone
    I.seeInCurrentUrl('/claim/claimant-phone');
    I.fillField('#telephoneNumber', '01234567890');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.YOUR_DETAILS, checkTaskList(taskListItems.YOUR_DETAILS, taskListStatus.COMPLETE));
  }

  theirDetails() {
    I.click(taskListItems.THEIR_DETAILS, checkTaskList(taskListItems.THEIR_DETAILS, taskListStatus.INCOMPLETE)); // Ensure the element exists

    //defendant-party-type-selection
    I.seeInCurrentUrl('/claim/defendant-party-type-selection');
    I.checkOption(`#${defendantPartyType.AN_INDIVIDUAL}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    //claimant-individual-details
    I.seeInCurrentUrl('/claim/defendant-individual-details');
    I.fillField('#title', 'title');
    I.fillField('#firstName', 'firstName');
    I.fillField('#lastName', 'title');
    I.click('Enter address manually');
    I.fillField('input[id="primaryAddress[addressLine1]"]', 'addressLine1');
    I.fillField('input[id="primaryAddress[city]"]', 'city');
    I.fillField('input[id="primaryAddress[postCode]"]', 'W1J 7NT');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    //defendant-email
    I.seeInCurrentUrl('/claim/defendant-email');
    I.fillField('#emailAddress', 'emailAddress@emailAddress.com');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    //claimant-phone
    I.seeInCurrentUrl('/claim/defendant-mobile');
    I.fillField('#telephoneNumber', '01234567890');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.THEIR_DETAILS, checkTaskList(taskListItems.THEIR_DETAILS, taskListStatus.COMPLETE));
  }

  claimAmount(withInterest) {
    I.click(taskListItems.CLAIM_AMOUNT, checkTaskList(taskListItems.CLAIM_AMOUNT, taskListStatus.INCOMPLETE)); // Ensure the element exists

    //amount
    I.seeInCurrentUrl('/claim/amount');
    I.fillField('#claimAmountRows[0][reason]', 'test');
    I.fillField('#claimAmountRows[0][amount]', '10000');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/claim/interest');
    if (withInterest) {
      I.checkOption(`#${yesAndNoCheckBoxOptionValue.YES}`);
      clickButton(buttonType.SAVE_AND_CONTINUE);
      //interest-type
      I.seeInCurrentUrl('/claim/interest-type');
      I.checkOption(`#${interestType.SAME_RATE_FOR_THE_WHOLE_PERIOD}`);
      clickButton(buttonType.SAVE_AND_CONTINUE);
      //interest-rate
      I.seeInCurrentUrl('/claim/interest-rate');
      I.checkOption(`#${sameRateInterestType.EIGHT_PERCENT}`);
      clickButton(buttonType.SAVE_AND_CONTINUE);
      //interest-date
      I.seeInCurrentUrl('/claim/interest-date');
      I.checkOption(`#${interestClaimFrom.THE_DATE_YOU_SUBMIT_THE_CLAIM}`);
      clickButton(buttonType.SAVE_AND_CONTINUE);

    } else {
      I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.CLAIM_AMOUNT, checkTaskList(taskListItems.CLAIM_AMOUNT, taskListStatus.COMPLETE));
  }
}

module.exports = new Response();
