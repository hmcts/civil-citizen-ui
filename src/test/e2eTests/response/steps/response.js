const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {responseTaskListItems, checkTaskList, taskListStatus} = require('../../commons/claimTaskList');
const {responseType, paymentType} = require('../../commons/responseVariables');
const {yesAndNoCheckBoxOptionValue, speakLanguage, documentLanguage, supportRequired, howOftenYouMakePayments} = require('../../commons/eligibleVariables');
const {seeInTitle} = require('../../commons/seeInTitle');
const {checkDateFields} = require('../../commons/checkDateFields');
const {checkResponseTypeFields} = require('../../commons/checkResponseTypeFields');
require('../../../functionalTests/specClaimHelpers/fixtures/cookies/eligibilityCookies');
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
    I.see('Your name and address were provided by the person, business or organisation claiming from you (the claimant).');

    I.see('Organisation name', 'h2.govuk-heading-m');
    I.see('Version 1', 'p.govuk-label');
    I.see('Contact person (optional)', 'label.govuk-label');
    I.seeElement('input.govuk-input#contactPerson');

    I.see('Company address', 'h2.govuk-heading-m');
    I.see('If your address is not correct you can change it here.Any changes will be shared with the claimant when you submit your response.');
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
    I.see('We will only call you if we need more information about this claim.');
    I.see('We\'ll give your phone number to the person, business, or organisation claiming from you, or to their legal representative, if they have one.');
    I.see('Use numbers only, for example, 01632960001.', 'div.govuk-hint');
    I.seeElement('input[id="telephoneNumber"]');
    I.fillField('#telephoneNumber', '07557777890');
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

  chooseResponsePartAdmitOfTheClaim(partialAdmitType) {
    I.click(responseTaskListItems.CHOOSE_A_RESPONSE, checkTaskList(responseTaskListItems.CHOOSE_A_RESPONSE, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/response-type');
    checkResponseTypeFields(responseType.I_ADMIT_PART_OF_THE_CLAIM);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/response/partial-admission/already-paid');
    seeInTitle('Already paid');
    I.see('Have you paid the claimant the amount you admit you owe?', 'h1.govuk-heading-l');
    I.checkOption(`#${partialAdmitType}`);
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
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    I.click(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, checkTaskList(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/full-rejection/how-much-have-you-paid');
    seeInTitle('How much have you paid?');

    I.see('How much have you paid?', 'h1.govuk-fieldset__heading');
    I.see('The total amount claimed is £1000. This includes the claim fee and any interest.', 'p.govuk-body-m');
    I.see('How much have you paid?', 'label.govuk-label');
    I.fillField('#amount', '1000');

    I.see('When did you pay this amount?', 'legend.govuk-fieldset__legend');
    checkDateFields(yesterday);

    I.see('How did you pay this amount?', 'label.govuk-label');
    I.fillField('textarea[id="text"]', 'test');

    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, checkTaskList(responseTaskListItems.TELL_US_HOW_MUCH_YOU_HAVE_PAID, taskListStatus.COMPLETE));
  }

  howMuchYouHavePaid(){
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    I.click(responseTaskListItems.HOW_MUCH_HAVE_YOU_PAID, checkTaskList(responseTaskListItems.HOW_MUCH_HAVE_YOU_PAID, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/partial-admission/how-much-have-you-paid');
    seeInTitle('How much have you paid?');

    I.see('How much have you paid the claimant?', 'h1.govuk-fieldset__heading');
    I.see('The total amount claimed is £1000. This includes the claim fee and any interest.', 'p.govuk-body-m');
    I.see('How much have you paid?', 'label.govuk-label');
    I.fillField('#amount', '1000');

    I.see('When did you pay this amount?', 'legend.govuk-fieldset__legend');
    checkDateFields(yesterday);

    I.see('How did you pay this amount?', 'label.govuk-label');
    I.fillField('textarea[id="text"]', 'test');

    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.HOW_MUCH_HAVE_YOU_PAID, checkTaskList(responseTaskListItems.HOW_MUCH_HAVE_YOU_PAID, taskListStatus.COMPLETE));
  }

  whyDoYouDisagreeWithTheAmountClaimed(){

    I.click(responseTaskListItems.WHY_DO_YOU_DISAGREE_WITH_THE_AMOUNT_CLAIMED, checkTaskList(responseTaskListItems.WHY_DO_YOU_DISAGREE_WITH_THE_AMOUNT_CLAIMED, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/partial-admission/why-do-you-disagree');
    seeInTitle('Why do you disagree?');

    I.see('Why do you disagree with the claim amount?', 'h1.govuk-heading-l');
    I.see('The total amount claimed is £1000. This includes the claim fee and any interest.');

    I.fillField('textarea[id="text"]', 'test');

    clickButton(buttonType.SAVE_AND_CONTINUE);

    //add your timeline of events
    I.seeInCurrentUrl('/response/timeline');
    seeInTitle('Add your timeline of events');
    I.see('Add your timeline of events', 'h1.govuk-heading-l');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    //List your evidence
    I.seeInCurrentUrl('/response/evidence');
    seeInTitle('List your evidence');
    I.see('List your evidence', 'h1.govuk-heading-l');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.see(responseTaskListItems.WHY_DO_YOU_DISAGREE_WITH_THE_AMOUNT_CLAIMED, checkTaskList(responseTaskListItems.WHY_DO_YOU_DISAGREE_WITH_THE_AMOUNT_CLAIMED, taskListStatus.COMPLETE));
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

  howMuchMoneyDoYouAdmitYouOwe(){
    I.click(responseTaskListItems.HOW_MUCH_MONEY_DO_YOU_ADMIT_YOU_OWE, checkTaskList(responseTaskListItems.HOW_MUCH_MONEY_DO_YOU_ADMIT_YOU_OWE, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/partial-admission/how-much-do-you-owe');
    seeInTitle('How much do you owe?');
    I.see('How much money do you admit you owe?', 'h1.govuk-fieldset__heading');
    I.see('The total amount claimed is £1000. This includes the claim fee and any interest.', 'div.govuk-hint');
    I.fillField('#amount', '500');

    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.see(responseTaskListItems.HOW_MUCH_MONEY_DO_YOU_ADMIT_YOU_OWE, checkTaskList(responseTaskListItems.HOW_MUCH_MONEY_DO_YOU_ADMIT_YOU_OWE, taskListStatus.COMPLETE));
  }

  whenWillYouPay(typeOfPayment){
    I.click(responseTaskListItems.WHEN_WILL_YOU_PAY, checkTaskList(responseTaskListItems.WHEN_WILL_YOU_PAY, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/partial-admission/payment-option');
    seeInTitle('Part Admit - Payment option');
    I.see('When do you want to pay the £500.00?', 'h1.govuk-fieldset__heading');

    I.seeElement('//label[contains(., "Immediately")]');
    I.seeElement('//label[contains(., "By a set date")]');
    I.seeElement('//label[contains(., "I\'ll suggest a repayment plan")]');
    I.checkOption(`#${typeOfPayment}`);

    clickButton(buttonType.SAVE_AND_CONTINUE);

    if(typeOfPayment === paymentType.BY_A_SET_DATE){
      this.paymentDatePartialAdmit();
    }

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.WHEN_WILL_YOU_PAY, checkTaskList(responseTaskListItems.WHEN_WILL_YOU_PAY, taskListStatus.COMPLETE));
  }

  freeTelephoneMediation(){
    I.click(responseTaskListItems.FREE_TELEPHONE_MEDIATION, checkTaskList(responseTaskListItems.FREE_TELEPHONE_MEDIATION, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/mediation/free-telephone-mediation');
    seeInTitle('Free telephone mediation');

    I.see('Free telephone mediation', 'h1.govuk-heading-l');
    I.see('We have automatically registered you for free telephone mediation from HM Courts and Tribunals Service.');

    I.see('How free mediation works', 'h2.govuk-heading-m');
    I.see('A trained, neutral mediator from HM Courts and Tribunals Service will listen to your views and help you to negotiate a settlement of your dispute.');
    I.see('Mediation can be quicker, cheaper and less stressful than going to court.', 'div.govuk-inset-text');
    I.see('Mediation is confidential, and nothing said in the mediation can be used in court proceedings if the dispute cannot be settled. The mediator speaks to each party separately, this is not a conference call.');
    I.see('The claimant must agree to mediation. We\'ll contact you within 28 days after the claimant\'s confirmation, to arrange a free appointment.');
    I.see('Your mediation appointment will last for no more than an hour.');
    I.see('Find out more about');
    I.see('free telephone mediation (opens in new tab).', 'a.govuk-link');

    I.see('Reaching a settlement', 'h2.govuk-heading-m');
    I.see('If mediation is successful, you\'ll make a verbal agreement over the phone. This is legally binding which means that you must comply with it. You will be given the terms of the agreement in a document – this is called a settlement agreement.');
    I.see('If either party breaks the terms the other party can go to court to ask for a judgment or hearing.');
    I.see('If mediation fails and a court hearing is needed, what happened during the mediation appointment cannot be mentioned in court.');
    I.see('You will not have to wait longer for a court hearing if you choose mediation.', 'div.govuk-inset-text');

    I.see('I do not agree to free mediation', 'a.govuk-link');

    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl('/mediation/can-we-use-company');
    seeInTitle('Mediation - Provide company contact number');

    I.see('Who should the mediation service call?', 'h1.govuk-fieldset__heading');
    I.see('Who should the mediation service call?', 'label.govuk-label');
    I.fillField('#mediationContactPerson', 'TEST');

    I.see('Enter this person’s phone number, including extension if required', 'label.govuk-label');
    I.see('For example, 02012346788 ext. 153', 'div.govuk-hint');
    I.fillField('#mediationPhoneNumber', '0123456789');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.see(responseTaskListItems.FREE_TELEPHONE_MEDIATION, checkTaskList(responseTaskListItems.FREE_TELEPHONE_MEDIATION, taskListStatus.COMPLETE));
  }

  giveUsDetailsInCaseThereIsAHearing(){
    I.click(responseTaskListItems.GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING, checkTaskList(responseTaskListItems.GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/directions-questionnaire/determination-without-hearing');
    seeInTitle('Determination without hearing');
    I.see('Determination without Hearing Questions', 'h1.govuk-heading-l');
    I.seeElement('//span[contains(., "Do you consider that this claim is suitable for determination without a hearing")]');
    I.see('i.e. by a judge reading and considering the case papers, witness statements and other documents filled by the parties, making a decision, and giving a note of reason for that decision?');

    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    I.see('Tell us why', 'label.govuk-label');
    I.fillField('textarea[id="reasonForHearing"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/expert');
    seeInTitle('Using an expert');
    I.see('Using an expert', 'h1.govuk-heading-l');
    I.see('It\'s rare for a judge to allow you to use an expert in a small claim. Most small claims don\'t need an expert.');
    I.see('An expert is not a legal representative.');

    I.see('An expert is not a legal representative.');
    I.seeElement('input.link-button#expertYes');
    clickButton(buttonType.CONTINUE_WITHOUT_AN_EXPERT);

    I.seeInCurrentUrl('/directions-questionnaire/give-evidence-yourself');
    seeInTitle('Defendant yourself evidence');
    I.see('Do you want to give evidence yourself?', 'h1.govuk-heading-l');

    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/other-witnesses');
    seeInTitle('Do you have other witnesses?');
    I.see('Do you have other witnesses?', 'h1.govuk-heading-l');
    I.see('This is someone who can confirm your version of events.');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/cant-attend-hearing-in-next-12-months');
    seeInTitle('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?');
    I.see('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', 'h1.govuk-heading-l');
    I.see('These should only be the dates of important events like medical appointments, other court hearing, or holidays you have already booked');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/phone-or-video-hearing');
    seeInTitle('Do you want to ask for a telephone or video hearing?');
    I.see('Do you want to ask for a telephone or video hearing?', 'h1.govuk-heading-l');
    I.see('The judge will decide if the hearing can be held by telephone or video.');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/vulnerability');
    seeInTitle('Vulnerability questions');
    I.see('Are you, your experts or witnesses vulnerable in a way that the court needs to consider?', 'h1.govuk-heading-l');
    I.see('This is someone who has been the victim of domestic or other abuse, has a learning disability, physical or mental illness or reduced mental capacity. The court will look at what adjustments or support the person needs.');
    I.checkOption(`#${yesAndNoCheckBoxOptionValue.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/support-required');
    seeInTitle('Support required');
    I.see('Do you, your experts or witnesses need support to attend a hearing?', 'h1.govuk-fieldset__heading');
    I.checkOption(`#${supportRequired.NO}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/court-location');
    seeInTitle('Specific court');
    I.see('Please select your preferred court hearing location.', 'h1.govuk-heading-l');
    I.see('You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing. Find your nearest court by postcode :');
    I.see('Select a court', 'label.govuk-label');

    I.selectOption('select[name="courtLocation"]', 'Barnet Civil and Family Centre - St Mary\'s Court, Regents Park Road - N3 1BQ');
    I.see('Tell us why you want the hearing to be held at this court', 'label.govuk-label');

    I.fillField('textarea[name="reason"]', 'test');

    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl('/directions-questionnaire/welsh-language');
    seeInTitle('Welsh language');
    I.see('Welsh language', 'h1.govuk-heading-l');
    I.see('Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');

    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.checkOption(`#${speakLanguage.ENGLISH}`);
    I.see('What languages will the documents be provided in?');
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

    I.see('Day', 'label.govuk-label');
    I.fillField('#day', futureDate.getDate());
    I.see('Month', 'label.govuk-label');
    I.fillField('#month', futureDate.getMonth() + 1);
    I.see('Year', 'label.govuk-label');
    I.fillField('#year', futureDate.getFullYear());
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  paymentDatePartialAdmit(){
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    futureDate.setMonth(futureDate.getMonth() + 2);

    I.seeInCurrentUrl('/partial-admission/payment-date');
    I.seeInTitle('Your money claims account - Money Claims');

    I.see('What date will you pay on?', 'h1.govuk-fieldset__heading');

    checkDateFields(futureDate);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  shareYourFinancialDetails() {
    I.click(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, checkTaskList(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/response/statement-of-means/intro');
    seeInTitle('Your financial details');
    I.see('Send Mr. Jan Clark your financial details', 'h1.govuk-heading-l');
    I.see('\'You need to send \' Mr. Jan Clark your company or organisation\'s most recent statement of accounts.');
    I.see('They\'ll review your accounts and can reject your suggested repayment plan if they believe you can pay sooner.');
    I.see('If they reject your plan, the court will make a new plan based on your financial details.');
    I.seeElement('a', 'Get Mr. Jan Clark \'s contact details.');

    clickButton(buttonType.CONTINUE);

    I.seeInCurrentUrl('/response/task-list');
    I.see(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, checkTaskList(responseTaskListItems.SHARE_YOUR_FINANCIAL_DETAILS, taskListStatus.COMPLETE));
  }

  yourRepaymentPlan(isPartial){
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    I.click(responseTaskListItems.YOUR_REPAYMENT_PLAN, checkTaskList(responseTaskListItems.YOUR_REPAYMENT_PLAN, taskListStatus.INCOMPLETE));
    I.seeInCurrentUrl('/payment-plan');
    seeInTitle('Your repayment plan');
    I.see('Your repayment plan', 'h1.govuk-fieldset__heading');

    if(isPartial){
      I.see('You admit you owe £500.', 'p.govuk-body-m');
      I.fillField('#paymentAmount', '250');
      futureDate.setMonth(futureDate.getMonth() + 1);
    } else {
      I.see('The total amount claimed is £1000.1.', 'p.govuk-body-m');
      I.see('This amount includes interest if it has been claimed which may continue to accrue to the date of Judgment, settlement agreement or earlier payment.', 'p.govuk-body-m');
      I.see('The amount does not include the claim fee and any fixed costs which are payable in addition.', 'p.govuk-body-m');
      I.fillField('#paymentAmount', '500');
    }

    I.see('Regular payments of:', 'p.govuk-body-m');
    I.see('For example, £200', 'div.govuk-hint');

    I.see('How often you\'ll make these payments?', 'legend.govuk-fieldset__legend');
    I.checkOption(`#${howOftenYouMakePayments.EACH_WEEK}`);

    I.waitForElement('#two-months_schedule', 1); // wait for 1 second
    I.see('2 weeks', '#two-weeks_schedule');

    I.see('When will you make the first payment?','legend.govuk-fieldset__legend');
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
    I.see('The information on this page forms your response. You can see it on the response form after you submit.');
    I.see('When you\'re satisfied that your answers are accurate, you should tick to "sign" this statement of truth on the form');
    I.see('You must hold a senior position in your organisation to sign the statement of truth.');
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
