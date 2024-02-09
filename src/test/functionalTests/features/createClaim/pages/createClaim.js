const I = actor();
/*const config = require('../../../../config');*/

const paths = {
  buttons: {
    i_have_confirmed_i_have_read_this: 'I confirm I\'ve read this',
    save_and_continue: 'Save and continue',
    find_address_field: '//input[@name=\'primaryAddressPostcode\']',
  },
  options: {
    individual_claimant: '#claimantPartyType',
    individual_defendant: '#defendantPartyType',
    yes: '#option',
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
    help_with_fees_reference_number: '#referenceNumber',
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
    I.see('For example, 9 2 2006');
    I.see('Day');
    I.see('Month');
    I.see('Year');
  }

  inputDateOfBirth() {
    I.fillField('#day','01');
    I.fillField('#month','06');
    I.fillField('#year','1975');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputPhoneNumber () {
    I.see('Enter a phone number (optional)','h1');
    I.see('We might need to speak to you about this claim.');
    I.see('We’ll only call on weekdays between 9am and 5pm.');
    I.see('We\'ll also give your number to the person, business, or organisation you are claiming from.');
    I.fillField(paths.fields.telephone_number,'07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirEmailAddress () {
    I.see('Their email address (optional)','h1');
    I.see('We\'ll use this to tell them you\'ve made a claim, as well as notifying them by post.');
    I.see('This must be their personal email address');
    I.fillField(paths.fields.email_address,'automationtest@hmcts.net');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirPhoneNumber () {
    I.see('Their phone number (optional)','h1');
    I.fillField(paths.fields.telephone_number,'07818731015');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmount () {
    I.see('Claim amount','h1');
    I.see('Your claim could be for a single amount or made up of multiple items.');
    I.see('Don’t include:');
    I.see('interest - we’ll ask you about this next');
    I.see('your claim fee - we’ll add this for you');
    I.see('What you’re claiming for?');
    I.see('Briefly explain each item - for example, "broken tiles", "roof damage"');
    I.see('Amount');
  }

  async inputClaimAmount () {
    I.fillField(paths.fields.claim_amount_reason_1,'Broken bathroom');
    I.fillField(paths.fields.claim_amount_amount_1,'1000');

    I.fillField(paths.fields.claim_amount_reason_2,'Lost Tap');
    I.fillField(paths.fields.claim_amount_amount_2,'100');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputDoYouWantToClaimInterest () {
    I.see('Do you want to claim interest?','h1');
    I.see('You can claim interest on the money you say you\'re owed.');
    I.see('The court will decide if you\'re entitled to it.');
    I.see('Yes');
    I.see('No');
    I.click(paths.options.yes);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHowDoYouWantToClaimInterest () {
    I.see('How do you want to claim interest?','h1');
    I.see('Same rate for the whole period');
    I.see('Break down interest for different time periods or items');
    I.click(paths.options.same_rate_for_the_whole_period);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim () {
    I.see('What annual rate of interest do you want to claim?','h1');
    I.see('You can claim 8% per year unless you know that a different rate applies.:');
    I.see('A different rate');
    I.click(paths.options.date_that_you_submit_claim);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputWhenWillYouClaimInterestFrom () {
    I.see('When are you claiming interest from?','h1');
    I.see('The date you submit the claim');
    I.see('If you submit after 4pm it will be the next working day.');
    I.see('A particular date');
    I.see('For example the date an invoice was overdue or that you told someone they owed you the money.');
    I.click(paths.options.when_will_you_claim_interest_from);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHelpWithFees () {
    I.see('Do you have a Help With Fees reference number?','h1');
    I.see('You\'ll only have one if you applied for Help With Fees.');
    I.see('Yes');
    I.click(paths.options.yes);
    I.see('Enter the Help With Fees number');
    I.fillField(paths.fields.help_with_fees_reference_number,'HWF-A1B-23C');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmountSummary() {
    I.see('Total amount you’re claiming','h1');
    I.see('Claim amount');
    I.see('£1000.00');
    I.see('Interest to date');
    I.see('£0');
    I.see('Claim fee');
    I.see('£70');
    I.see('Total claim amount');
    I.see('£1070.00');
    I.see('We’ll review your Help With Fees application after you submit the claim','h3');
    I.see('If it’s successful, you may not have to pay any or all of the claim fee.');
    I.see('That would mean the total claim amount would be lower than the amount shown on this page.');
    I.see('If it’s unsuccessful, we’ll ask you to pay the claim fee shown on this page in full.');
    I.seeElement('//span[contains(.,\'How interest to date is calculated?\')]');
    I.see('If you settle out of court','h3');
    I.see('We won’t refund your claim fee.');
    I.see('You can ask the defendant to pay back your claim fee as part of the settlement.');
    I.see('Other fees');
    I.see('Hearing fee');
    I.see('£85');
    I.see('You don’t have to pay a hearing fee unless the claim goes to a hearing.');
    I.see('There may be additional fees as your case progresses.');
    I.seeElement('//a[.=\'Find out more about court fees (opens in a new tab)\']');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimDetails () {
    I.see('Briefly explain your claim','h1');
    I.see('Tell us why you believe the defendant owes you money.');
    I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    I.see('You\'ll have to pay an extra fee if you want to change the details of the claim later.');
    I.fillField('#text','Unprofessional Builder');
    this.clickNextAction(paths.buttons.save_and_continue);
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
