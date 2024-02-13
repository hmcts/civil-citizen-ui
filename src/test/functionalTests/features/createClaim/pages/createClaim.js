const I = actor();
/*const config = require('../../../../config');*/

const paths = {
  links: {
    how_is_interest_calculated: '//span[contains(.,\'How interest to date is calculated?\')]',
    find_out_more_about_court_fees: '//a[.=\'Find out more about court fees (opens in a new tab)\']',
    privacy_policy: '//a[.=\'privacy policy\']',
  },
  buttons: {
    i_have_confirmed_i_have_read_this: 'I confirm I\'ve read this',
    save_and_continue: 'Save and continue',
    find_address_field: '//input[@name=\'primaryAddressPostcode\']',
    submit_claim: 'Submit claim',
  },
  options: {
    individual_claimant: '#claimantPartyType',
    individual_defendant: '#defendantPartyType',
    yes: '#option',
    no: '//input[@value=\'no\']',
    same_rate_for_the_whole_period: '#interestType',
    same_interest_rate_type: '#sameRateInterestType',
    date_that_you_submit_claim: '#sameRateInterestType',
    when_will_you_claim_interest_from: '#interestClaimFrom',
  },
  fields: {
    individual_title: '#individualTitle',
    individual_first_name: '#individualFirstName',
    individual_last_name: '#individualLastName',
    telephone_number: '#telephoneNumber',
    email_address: '#emailAddress',
    claim_amount_reason_1: '(//input[@id=\'claimAmountRows[0][reason]\'])[1]',
    claim_amount_amount_1: '(//input[@id=\'claimAmountRows[0][amount]\'])[1]',
    claim_amount_reason_2: '(//input[@id=\'claimAmountRows[1][reason]\'])[1]',
    claim_amount_amount_2: '(//input[@id=\'claimAmountRows[1][amount]\'])[1]',
    claim_amount_reason_3: '(//input[@id=\'claimAmountRows[2][reason]\'])[1]',
    claim_amount_amount_3: '(//input[@id=\'claimAmountRows[2][amount]\'])[1]',
    claim_amount_reason_4: '(//input[@id=\'claimAmountRows[3][reason]\'])[1]',
    claim_amount_amount_4: '(//input[@id=\'claimAmountRows[3][amount]\'])[1]',
    help_with_fees_reference_number: '#referenceNumber',
    claim_details_text: '#text',

    timeline_row_0_day: '(//input[@name=\'rows[0][day]\'])[1]',
    timeline_row_0_month: '(//input[@name=\'rows[0][month]\'])[1]',
    timeline_row_0_year: '(//input[@name=\'rows[0][year]\'])[1]',
    timeline_row_0_description: '(//textarea[@name=\'rows[0][description]\'])[1]',
    timeline_row_1_day: '(//input[@name=\'rows[1][day]\'])[1]',
    timeline_row_1_month: '(//input[@name=\'rows[1][month]\'])[1]',
    timeline_row_1_year: '(//input[@name=\'rows[1][year]\'])[1]',
    timeline_row_1_description: '(//textarea[@name=\'rows[1][description]\'])[1]',
    timeline_row_2_day: '(//input[@name=\'rows[2][day]\'])[1]',
    timeline_row_2_month: '(//input[@name=\'rows[2][month]\'])[1]',
    timeline_row_2_year: '(//input[@name=\'rows[2][year]\'])[1]',
    timeline_row_2_description: '(//textarea[@name=\'rows[2][description]\'])[1]',
    timeline_row_3_day: '(//input[@name=\'rows[3][day]\'])[1]',
    timeline_row_3_month: '(//input[@name=\'rows[3][month]\'])[1]',
    timeline_row_3_year: '(//input[@name=\'rows[3][year]\'])[1]',
    timeline_row_3_description: '(//textarea[@name=\'rows[3][description]\'])[1]',
    timeline_row_4_day: '(//input[@name=\'rows[4][day]\'])[1]',
    timeline_row_4_month: '(//input[@name=\'rows[4][month]\'])[1]',
    timeline_row_4_year: '(//input[@name=\'rows[4][year]\'])[1]',
    timeline_row_4_description: '(//textarea[@name=\'rows[4][description]\'])[1]',

    evidence_list_1: '//fieldset[1]//select[@class=\'govuk-select\']',
    evidence_list_description_1: '//fieldset[1]//textarea[@class=\'govuk-textarea\']',
    evidence_list_2: '//fieldset[2]//select[@class=\'govuk-select\']',
    evidence_list_description_2: '//fieldset[2]//textarea[@class=\'govuk-textarea\']',
    statement_of_truth: '#signed',
    no_changes_allowed_declaration: '#acceptNoChangesAllowed',

  },
};

class CreateClaim {

  async verifyLanguage() {
    I.see('Language', 'h1');
    I.see('You must choose which language you want to use to make this claim.');
    I.see('If you select \'Welsh\', information and documents will be presented in Welsh.');
    I.see('But some notifications about your claim will still be in English.');
    I.see('In what language do you want to make your claim?', 'h4');
    I.click('#option'); //English
    I.click('Save and continue');
  }

  async verifyDashboard() {
    I.see('Application complete', 'h2');
    I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    I.see('Consider other options', 'h2');
    I.see('Prepare your claim', 'h2');
    I.see('Submit', 'h2');
  }

  async verifyTryToResolveTheDispute() {
    I.see('Try to resolve the dispute', 'h1');
    I.see('Before you claim you should:');
    I.see('talk to the person or organisation you want to claim against');
    I.see('consider mediation');
    I.see('Talk to the person or organisation', 'h2');
    I.see('Try to resolve the dispute by:');
    I.see('telling them why you intend to make a claim against them');
    I.see('suggesting timetable with actions you want them to take');
    I.see('explaining you\'ll make a claim against them if they don\'t follow your timetable');
    this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
  }

  async verifyCompletingYourClaim() {

    I.see('Get the details right', 'h1');
    I.see('You\'ll have to pay an additional fee if you want you:');
    I.see('change the name of anyone involved with the claim');
    I.see('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
    I.see('add information that significantly change your claim');
    this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
  }

  verifyAboutYouAndThisClaimForClaimant() {
    I.see('About you and this claim', 'h1');
    I.see('I\'m claiming as:');
    I.see('An individual');
    I.see('You\'re claiming for yourself');
    I.see('A sole trader or self-employed person');
    I.see('For example a tradesperson');
    I.see('A limited company');
    I.see('For example a company that sells goods or services');
    I.see('Another type of organisation');
    I.see('For example a partnership, trust, charity, club or association');
    I.click(paths.options.individual_claimant);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyAboutYouAndThisClaimForDefendant() {
    I.see('Who are you making the claim against?', 'h1');
    I.see('An individual');
    I.see('For example someone you lent money to');
    I.see('For example a tradesperson who did work for you');
    I.see('For example a tradesperson');
    I.see('A limited company');
    I.see('For example a company that sold you goods or services');
    I.see('Another type of organisation');
    I.see('For example a partnership, trust, charity, club or association');
    I.click(paths.options.individual_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyEnterYourDetails() {
    I.see('Enter your details', 'h1');
    I.see('These details are shared with the person, business or organisation you are claiming from (the defendant).');
    I.see('Title');
    I.see('First name');
    I.see('Last name');
    I.see('Your postal address', 'h2');
    I.see('If your address is not correct you can change it here.');
    I.see('Any changes will be shared with the claimant when you submit your response.');
    I.see('Enter a UK postcode');
    I.see('Correspondence address', 'h2');
    I.see('Would you like correspondence sent to a different address?');
    I.see('No');
    I.see('Yes, add a correspondence address');
  }

  verifyEnterDefendantsDetails() {
    I.see('Enter the defendant’s details', 'h1');
    I.see('You’ll have to pay extra fee if you later want to change the name of anyone involved with the claim.');
    I.see('Title');
    I.see('First name');
    I.see('Last name');
    I.see('Their address', 'h2');
    I.see('If your address is not correct you can change it here.');
    I.see('Any changes will be shared with the claimant when you submit your response.');
    I.see('The address must be in England or Wales.');
    I.see('Your claim may be invalid if you use the wrong address.');
    I.see('You must enter their usual or last known home address.');
    I.see('You cannot use their work address.');
    I.see('Enter a UK postcode');
  }

  inputEnterYourDetails(claimantFlag) {
    if (claimantFlag === true) {
      I.fillField(paths.fields.individual_title, 'Mr');
      I.fillField(paths.fields.individual_first_name, 'Joe');
      I.fillField(paths.fields.individual_last_name, 'Bloggs');
    } else if (claimantFlag === false) {
      I.fillField(paths.fields.individual_title, 'Mrs');
      I.fillField(paths.fields.individual_first_name, 'Jane');
      I.fillField(paths.fields.individual_last_name, 'Doe');
    }
    I.fillField(paths.buttons.find_address_field, 'MK5 7HH');
    this.clickNextAction('Find address');
    I.waitForVisible('#primaryAddresspostcodeAddress', 3);
    I.see('Pick an address');
    if (claimantFlag === true) {
      I.selectOption('#primaryAddresspostcodeAddress',
        'THE COMMUNITY CENTRE, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    } else if (claimantFlag === false) {
      I.selectOption('#primaryAddresspostcodeAddress',
        'ARCANA, 54, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    }
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyDateOfBirth() {
    I.see('What is your date of birth?', 'h1');
    I.see('Day');
    I.see('Month');
    I.see('Year');
  }

  inputDateOfBirth() {
    I.fillField('#day', '01');
    I.fillField('#month', '06');
    I.fillField('#year', '1975');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputPhoneNumber() {
    I.see('Enter a phone number (optional)', 'h1');
    I.see('We might need to speak to you about this claim.');
    I.see('We’ll only call on weekdays between 9am and 5pm.');
    I.see('We\'ll also give your number to the person, business, or organisation you are claiming from.');
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirEmailAddress() {
    I.see('Their email address (optional)', 'h1');
    I.see('We\'ll use this to tell them you\'ve made a claim, as well as notifying them by post.');
    I.see('This must be their personal email address');
    I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirPhoneNumber() {
    I.see('Their phone number (optional)', 'h1');
    I.fillField(paths.fields.telephone_number, '07818731015');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmount() {
    I.see('Claim amount', 'h1');
    I.see('Your claim could be for a single amount or made up of multiple items.');
    I.see('Don’t include:');
    I.see('interest - we’ll ask you about this next');
    I.see('your claim fee - we’ll add this for you');
    I.see('What you’re claiming for?');
    I.see('Briefly explain each item - for example, "broken tiles", "roof damage"');
    I.see('Amount');
  }

  async verifyAndInputDoYouWantToClaimInterest() {
    I.see('Do you want to claim interest?', 'h1');
    I.see('You can claim interest on the money you say you\'re owed.');
    I.see('The court will decide if you\'re entitled to it.');
    I.see('Yes');
    I.see('No');
    I.click(paths.options.yes);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHowDoYouWantToClaimInterest() {
    I.see('How do you want to claim interest?', 'h1');
    I.see('Same rate for the whole period');
    I.see('Break down interest for different time periods or items');
    I.click(paths.options.same_rate_for_the_whole_period);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim() {
    I.see('What annual rate of interest do you want to claim?', 'h1');
    I.see('You can claim 8% per year unless you know that a different rate applies.:');
    I.see('A different rate');
    I.click(paths.options.date_that_you_submit_claim);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputWhenWillYouClaimInterestFrom() {
    I.see('When are you claiming interest from?', 'h1');
    I.see('The date you submit the claim');
    I.see('If you submit after 4pm it will be the next working day.');
    I.see('A particular date');
    I.see('For example the date an invoice was overdue or that you told someone they owed you the money.');
    I.click(paths.options.when_will_you_claim_interest_from);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHelpWithFees() {
    I.see('Do you have a Help With Fees reference number?', 'h1');
    I.see('You\'ll only have one if you applied for Help With Fees.');
    I.see('Yes');
    I.click(paths.options.no);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async inputClaimAmount() {
    I.fillField(paths.fields.claim_amount_reason_1, 'Broken bathroom');
    I.fillField(paths.fields.claim_amount_amount_1, '1000');

    I.fillField(paths.fields.claim_amount_reason_2, 'Lost Tap');
    I.fillField(paths.fields.claim_amount_amount_2, '100');

    I.fillField(paths.fields.claim_amount_reason_3, 'Late Delivery');
    I.fillField(paths.fields.claim_amount_amount_3, '400');

    I.fillField(paths.fields.claim_amount_reason_4, 'Temporary Entry for Automation Blur');
    I.fillField(paths.fields.claim_amount_amount_4, '20.00');

    I.see('£ 1500.00');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmountSummary() {
    I.see('Total amount you’re claiming', 'h1');
    I.see('Claim amount');
    I.see('£1520.00');
    I.see('Interest to date');
    I.see('£0');
    I.see('Claim fee');
    I.see('£115');
    I.see('Total claim amount');
    I.see('£1635.00');
    I.seeElement(paths.links.how_is_interest_calculated);
    I.see('If you settle out of court', 'h3');
    I.see('We won’t refund your claim fee.');
    I.see('You can ask the defendant to pay back your claim fee as part of the settlement.');
    I.see('Other fees');
    I.see('Hearing fee');
    I.see('£181');
    I.see('You don’t have to pay a hearing fee unless the claim goes to a hearing.');
    I.see('There may be additional fees as your case progresses.');
    I.seeElement(paths.links.find_out_more_about_court_fees);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputClaimDetails() {
    I.see('Briefly explain your claim', 'h1');
    I.see('Tell us why you believe the defendant owes you money.');
    I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    I.see('You\'ll have to pay an extra fee if you want to change the details of the claim later.');
    I.fillField(paths.fields.claim_details_text, 'Unprofessional Builder');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimDetailsTimeline() {
    I.see('Timeline of events', 'h1');
    I.see('If you don’t know exact date, tell us the month and year');
    I.see('Example timeline', 'h2');
    I.see('12 November 2023 - John Smith gave me a quote to replace the roof.');
    I.see('14 November 2023 - We agreed and signed a contract for the work.');
    I.see('12 December 2023 - I noticed a leak on the landing and told Mr Smith about this.');
    I.see('Date');
    I.see('What happened');
    I.see('For example, you might have signed a contract');
    I.see('Day');
    I.see('Month');
    I.see('Year');
  }

  async inputClaimDetailsTimeline() {
    I.fillField(paths.fields.timeline_row_0_day, '01');
    I.fillField(paths.fields.timeline_row_0_month, '06');
    I.fillField(paths.fields.timeline_row_0_year, '1975');
    I.fillField(paths.fields.timeline_row_0_description, 'Drafting of Contracts');

    I.fillField(paths.fields.timeline_row_1_day, '10');
    I.fillField(paths.fields.timeline_row_1_month, '06');
    I.fillField(paths.fields.timeline_row_1_year, '1975');
    I.fillField(paths.fields.timeline_row_1_description, 'Work Begins');

    I.fillField(paths.fields.timeline_row_2_day, '15');
    I.fillField(paths.fields.timeline_row_2_month, '06');
    I.fillField(paths.fields.timeline_row_2_year, '1975');
    I.fillField(paths.fields.timeline_row_2_description, 'Loss of the tap');

    I.fillField(paths.fields.timeline_row_3_day, '20');
    I.fillField(paths.fields.timeline_row_3_month, '06');
    I.fillField(paths.fields.timeline_row_3_year, '1975');
    I.fillField(paths.fields.timeline_row_3_description, 'Work not delivered and bathroom broken.Dispute with the Builder');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyListEvidence() {
    I.see('List your evidence', 'h1');
    I.see('List your evidence (optional)');
    I.see('Tell us about any evidence you wish to provide.');
    I.see('You do not need to send us any evidence now.');
    I.see('If your case goes to a court hearing, and is not settled, you will need to provide evidence.');
  }

  async inputEvidenceList() {
    I.selectOption(paths.fields.evidence_list_1,
      'Contracts and agreements');
    I.fillField(paths.fields.evidence_list_description_1, 'Signed Contract');
    I.selectOption(paths.fields.evidence_list_2,
      'Receipts');
    I.fillField(paths.fields.evidence_list_description_2, 'Expenses Receipt');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async rerouteFromEqualityAndDiversity(checkAndSubmitClaim) {
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if (url.includes('pcq')) {
      I.amOnPage('/claim/task-list');
      I.click(checkAndSubmitClaim);
    }
  }

  async verifyCheckYourAnswers() {
    I.see('Check your answers', 'h1');

    I.see('Your details (claimant)', 'h2');

    I.see('Full name');
    I.see('Mr Joe Bloggs');

    I.see('Address');
    I.see('THE COMMUNITY CENTRE');
    I.see('MILTON KEYNES');
    I.see('MK5 7HH');

    I.see('Correspondence address');

    I.see('Date of birth');
    I.see('1 June 1975');

    I.see('Contact number (optional)');
    I.see('07818731017');

    I.see('Their details (defendant)');
    I.see('Full name');
    I.see('Mrs Jane Doe');

    I.see('ARCANA');
    I.see('MILTON KEYNES');
    I.see('MK5 7HH');

    I.see('Same as address');

    I.see('Email');
    I.see('civilmoneyclaimsdemo@gmail.com');

    I.see('07818731015');

    I.see('Claim amount', 'h2');

    I.see('Broken bathroom');
    I.see('£1,000');
    I.see('Lost Tap');
    I.see('£100');
    I.see('Late Delivery');
    I.see('£400');

    I.see('Claim Interest');
    I.see('yes');

    I.see('How do you want to claim interest?');
    I.see('Same rate for the whole period');

    I.see('What annual rate of interest do you want to claim?');
    I.see('8.00%');

    I.see('When are you claiming interest from?');
    I.see('The date you submit the claim');

    I.see('Claim Details');
    I.see('Unprofessional Builder');

    I.see('Timeline of what happened');
    I.see('1 June 1975');
    I.see('Drafting of Contracts');
    I.see('10 June 1975');
    I.see('Work Begins');
    I.see('15 June 1975');
    I.see('Loss of the tap');
    I.see('20 June 1975');
    I.see('Work not delivered and bathroom broken.Dispute with the Builder');

    I.see('Your evidence (optional)');
    I.see('Signed Contract');
    I.see('Contracts and agreements');
    I.see('Receipts');
    I.see('Expenses Receipt');

    I.see('Statement of truth');
    I.see('The information on this page forms your response.');
    I.see('You can see it on the response form after you submit.');
    I.see('When you\'re satisfied that your answers are accurate,');
    I.see('I believe that the facts stated in this claim are true.');
    I.see('I understand that proceedings for contempt of court may be brought against anyone who makes,');
    I.see('or causes to be made,');
    I.see('a false statement in a document verified by a statement of truth without an honest belief in its truth.');

    I.click(paths.fields.no_changes_allowed_declaration);
    I.click(paths.fields.statement_of_truth);
    I.click(paths.buttons.submit_claim);
  }

  async verifyClaimSubmitted() {
    I.see('Claim submitted', 'h1');
    I.see('Claim number:');
    const claimReference = await I.grabTextFrom('//div[contains(text(),\'Claim number\')]/strong');
    I.see('What happens next', 'h2');
    I.see('Your claim will not be issued and sent to the other parties until you have paid the claim fee.');
    I.see('If the defendant pays you');
    I.see('You need to sign in to your account to tell us you\'ve been paid.');
    I.seeElement('//a[contains(text(),\'What did you think of this service?\')]');
    I.see('Email', 'h3');
    I.see('Telephone');
    I.see('0300 123 7050');
    I.see('Monday to Friday, 8.30am to 5pm.');
    I.seeElement('//a[.=\'Find out about call charges (opens in a new window)\']');
    return claimReference;
  }

  async verifyAndInputPayYourClaimFee() {
    I.see('Pay your claim fee', 'h1');
    I.see('Claim amount');
    I.see('£1520');
    I.see('Claim fee');
    I.see('£1635');
    I.see('If you settle out of court we won\'t refund your claim fee.');
    I.see('You can ask the defendant to pay back your claim fee as part of the settlement.');
    I.click('continue to payment(£115)');
  }

  async verifyAndInputCardDetails() {
    I.see('Enter card details', 'h1');
    I.see('Payment summary','h2');
    I.see('card payment');
    I.see('Total amount:');
    I.see('£115.00');
    I.fillField('#card-no' ,'4444333322221111');
    I.fillField('#expiry-month' ,new Date().getMonth());
    I.fillField('#expiry-year' ,new Date().getFullYear()+1);
    I.fillField('#cardholder-name','Test Name');
    I.fillField('#cvc', '444');
    I.fillField('[autocomplete=\'billing address-line1\']', '220 Helena House');
    I.fillField('#address-city','Swansea');
    I.fillField('#address-postcode','SA1 1XW');
    I.fillField('#email','testxxx@hmcts.net');
    I.click('Continue');
  }
  async verifyConfirmYourPayment() {

    I.see('Confirm your payment','h1');
    I.see('Payment summary','h2');
    I.see('card payment');
    I.see('Total amount:');
    I.see('£115.00');
    I.click('Confirm payment');

  }

  async verifyYourPaymentWasSuccessfull() {

    I.see('Your payment was');
    I.see('successful');
    I.see('Your payment reference number is');
    I.see('You\'ll receive a confirmation email in the next hour.');
    I.see('Payment summary','h3');
    I.see('Payment for');
    I.see('Claim fee');
    I.see('Total amount');
    I.see('£115');
    I.click('Go to your account');

  }
  async verifyDashboardLoaded() {
    I.waitForText('Submit', 'h2');
    I.see('Application complete', 'h2');
  }

  clickNextAction(action) {
    I.click(action);
  }
}

module.exports = CreateClaim;
