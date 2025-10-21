const {clickButton} = require('../../commons/clickButton');
const eligibilityCookie = require('../../../functionalTests/specClaimHelpers/fixtures/cookies/eligibilityCookies');
const {buttonType} = require('../../commons/buttonVariables');
const {taskListItems, taskListStatus, checkTaskList} = require('../../commons/claimTaskList');
const {claimantPartyType, defendantPartyType, yesAndNoCheckBoxOptionValue,
  interestType, sameRateInterestType, interestClaimFrom} = require('../../commons/eligibleVariables');

const I = actor();

class ClaimCreation {
  start(optionValue) {
    I.setCookie(eligibilityCookie);
    I.amOnPage('/claim/bilingual-language-preference');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/claim/task-list');
  }

  considerOtherOptions() {
    I.click(taskListItems.RESOLVING_THIS_DISPUTE); // Ensure the element exists
    I.seeInCurrentUrl('/claim/resolving-this-dispute');
    clickButton(buttonType.I_CONFIRM_I_HAVE_READ_THIS);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.RESOLVING_THIS_DISPUTE, checkTaskList(taskListItems.RESOLVING_THIS_DISPUTE, taskListStatus.COMPLETE));
  }

  completingYourClaim() {
    I.click(taskListItems.COMPLETING_YOUR_CLAIM); // Ensure the element exists
    I.seeInCurrentUrl('/claim/completing-claim');
    clickButton(buttonType.I_CONFIRM_I_HAVE_READ_THIS);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.COMPLETING_YOUR_CLAIM, checkTaskList(taskListItems.COMPLETING_YOUR_CLAIM, taskListStatus.COMPLETE));
  }

  yourDetails() {
    I.click(taskListItems.YOUR_DETAILS); // Ensure the element exists

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
    I.click(taskListItems.THEIR_DETAILS); // Ensure the element exists

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

  claimAmount(withInterest, helpWithFeesReferenceNumber) {
    I.click(taskListItems.CLAIM_AMOUNT); // Ensure the element exists

    //amount
    I.seeInCurrentUrl('/claim/amount');
    I.fillField('input[id="claimAmountRows[0][reason]"]', 'test');
    I.fillField('input[id="claimAmountRows[0][amount]"]', '10000');
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

    //help-with-fees
    I.seeInCurrentUrl('/claim/help-with-fees');
    if(helpWithFeesReferenceNumber){
      I.checkOption(`#${yesAndNoCheckBoxOptionValue.YES}`);
      I.fillField('input[id="referenceNumber"]', '00000');
    } else {
      I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    }
    clickButton(buttonType.SAVE_AND_CONTINUE);

    //claim/total
    I.seeInCurrentUrl('/claim/total');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.CLAIM_AMOUNT, checkTaskList(taskListItems.CLAIM_AMOUNT, taskListStatus.COMPLETE));
  }

  claimDetails() {
    I.click(taskListItems.CLAIM_DETAILS); // Ensure the element exists

    //reason
    I.seeInCurrentUrl('/claim/reason');
    I.fillField('textarea[id="text"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    //timeline
    I.seeInCurrentUrl('/claim/timeline');
    I.fillField('input[id="rows-0-day"]', '01');
    I.fillField('input[id="rows-0-month"]', '01');
    I.fillField('input[id="rows-0-year"]', '2024');
    I.fillField('textarea[id="rows[0][description]"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    //evidence
    I.seeInCurrentUrl('/claim/evidence');
    I.selectOption('//fieldset[1]//select[@class=\'govuk-select\']','Contracts and agreements');
    I.fillField('//fieldset[1]//textarea[@class=\'govuk-textarea\']', 'Signed Contract');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl('/claim/task-list');
    I.see(taskListItems.CLAIM_DETAILS, checkTaskList(taskListItems.CLAIM_DETAILS, taskListStatus.COMPLETE));
  }

  checkAndSubmitYourClaim() {
    I.setCookie(eligibilityCookie);
    I.amOnPage('/claim/task-list');
    I.click(taskListItems.CHECK_AND_SUBMIT_YOUR_CLAIM, checkTaskList(taskListItems.CHECK_AND_SUBMIT_YOUR_CLAIM, taskListStatus.INCOMPLETE));
    //check-and-send
    I.seeInCurrentUrl('/claim/check-and-send');
    I.checkOption('#signed');
    clickButton(buttonType.SUBMIT_CLAIM);
    I.seeInCurrentUrl('/confirmation');
  }

}

module.exports = new ClaimCreation();
