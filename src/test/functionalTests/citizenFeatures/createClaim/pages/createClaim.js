const I = actor();

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
    sole_trader_claimant: '#claimantPartyType-2',
    limited_company_claimant: '#claimantPartyType-3',
    org_claimant: '#claimantPartyType-4',
    individual_defendant: '#defendantPartyType',
    sole_trader_defendant: '#defendantPartyType-2',
    limited_company_defendant: '#defendantPartyType-3',
    org_defendant: '#defendantPartyType-4',
    yes: '#option',
    no: '//input[@value=\'no\']',
    same_rate_for_the_whole_period: '#interestType',
    same_interest_rate_type: '#sameRateInterestType',
    variable_interest_rate_type: '#interestType-2',
    date_that_you_submit_claim: '#interestClaimFrom',
    interest_to_applied: '#amount',
    interest_reason: '#reason',
    claim_interest_after_submission: '#option',
    claim_specific_interest_after_submission: '#option-2',
    when_will_you_claim_interest_from: '#interestClaimFrom',
    claim_interest_from_specific_date: '#interestClaimFrom-2',
    daily_interest_amount: '#dailyInterestAmount',
  },
  fields: {
    individual_title: '#title',
    individual_first_name: '#firstName',
    individual_last_name: '#lastName',
    telephone_number: '#telephoneNumber',
    soleTraderTradingAs: '#soleTraderTradingAs',
    OrgpartyName: 'partyName',
    OrgContactPerson: 'contactPerson',
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
    signerName: '#signerName',
    signerRole:'#signerRole',
  },
};

class CreateClaim {

  async verifyLanguage() {
    I.waitForContent('In what language do you want to make your claim?', 60, 'h4');
    I.see('Language', 'h1');
    I.see('You must choose which language you want to use to make this claim.');
    I.see('If you select \'Welsh\', information and documents will be presented in Welsh.');
    I.see('But some notifications about your claim will still be in English.');
    I.click('#option'); //English
    I.click('Save and continue');
  }

  async verifyDashboard() {
    I.waitForContent('Submit', 60, 'h2');
    I.see('Application complete', 'h2');
    I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    I.see('Consider other options', 'h2');
    I.see('Prepare your claim', 'h2');
  }

  async verifyTryToResolveTheDispute() {
    I.waitForContent('explaining you\'ll make a claim against them if they don\'t follow your timetable',60);
    I.see('Try to resolve the dispute', 'h1');
    I.see('Before you claim you should:');
    I.see('talk to the person or organisation you want to claim against');
    I.see('consider mediation');
    I.see('Talk to the person or organisation', 'h2');
    I.see('Try to resolve the dispute by:');
    I.see('telling them why you intend to make a claim against them');
    I.see('suggesting timetable with actions you want them to take');
    this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
  }

  async verifyCompletingYourClaim() {
    I.waitForContent('add information that significantly change your claim',60);
    I.see('Get the details right', 'h1');
    I.see('You\'ll have to pay an additional fee if you want you:');
    I.see('change the name of anyone involved with the claim');
    I.see('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
    this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
  }

  verifyAboutYouAndThisClaimForClaimant() {
    I.waitForContent('For example a partnership, trust, charity, club or association',60);
    I.see('About you and this claim', 'h1');
    I.see('I\'m claiming as:');
    I.see('An individual');
    I.see('You\'re claiming for yourself');
    I.see('A sole trader or self-employed person');
    I.see('For example a tradesperson');
    I.see('A limited company');
    I.see('For example a company that sells goods or services');
    I.see('Another type of organisation');
    I.click(paths.options.individual_claimant);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyAboutYouAndThisClaimForDefendant() {
    I.waitForContent('For example a partnership, trust, charity, club or association', 60);
    I.see('Who are you making the claim against?', 'h1');
    I.see('An individual');
    I.see('For example someone you lent money to');
    I.see('For example a tradesperson who did work for you');
    I.see('For example a tradesperson');
    I.see('A limited company');
    I.see('For example a company that sold you goods or services');
    I.see('Another type of organisation');
    I.click(paths.options.individual_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyEnterYourDetails() {
    I.waitForContent('Yes, add a correspondence address', 60);
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
  }

  verifyEnterDefendantsDetails() {
    I.waitForContent('Enter a UK postcode', 60);
    I.see('Enter the defendant’s details', 'h1');
    I.see('You’ll have to pay extra fee if you later want to change the name of anyone involved with the claim.');
    I.see('Title');
    I.see('First name');
    I.see('Last name');
    I.see('Their address', 'h2');
    I.see('The address must be in England or Wales.');
    I.see('Your claim may be invalid if you use the wrong address.');
    I.see('You must enter their usual or last known home address.');
    I.see('You cannot use their work address.');
  }

  async inputEnterYourDetails(claimantFlag) {
    if (claimantFlag === true) {
      I.fillField(paths.fields.individual_title, 'Mr');
      I.fillField(paths.fields.individual_first_name, 'Joe');
      I.fillField(paths.fields.individual_last_name, 'Bloggs');
    } else if (claimantFlag === false) {
      I.fillField(paths.fields.individual_title, 'Mrs');
      I.fillField(paths.fields.individual_first_name, 'Jane');
      I.fillField(paths.fields.individual_last_name, 'Doe');
    }
    await this.selectAddress(claimantFlag);
  }

  async selectAddress(claimantFlag) {
    const isPlaywrightActive = await I.isPlaywright();
    await I.fillField(paths.buttons.find_address_field, 'MK5 7HH');
    await this.clickNextAction('Find address');
    I.wait(2);
    I.waitForVisible('#primaryAddresspostcodeAddress', 3);
    I.see('Pick an address');
    if (!isPlaywrightActive) {
      I.waitForClickable('#primaryAddresspostcodeAddress', 30);
    }
    if (claimantFlag === true) {
      I.selectOption('#primaryAddresspostcodeAddress',
        'THE COMMUNITY CENTRE, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    } else if (claimantFlag === false) {
      I.selectOption('#primaryAddresspostcodeAddress',
        'ARCANA, 54, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    }
    I.wait(2);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyDateOfBirth() {
    I.waitForContent('Year', 60);
    I.see('What is your date of birth?', 'h1');
    I.see('Day');
    I.see('Month');
  }

  inputDateOfBirth() {
    I.fillField('#day', '01');
    I.fillField('#month', '06');
    I.fillField('#year', '1975');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputPhoneNumber() {
    I.waitForContent('We\'ll also give your number to the person, business, or organisation you are claiming from.', 60);
    I.see('Enter a phone number', 'h1');
    I.see('We might need to speak to you about this claim.');
    I.see('We’ll only call on weekdays between 9am and 5pm.');
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirEmailAddress() {
    I.waitForContent('This must be their personal email address', 60);
    I.see('Their email address (optional)', 'h1');
    I.see('We\'ll use this to tell them you\'ve made a claim, as well as notifying them by post.');
    I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirPhoneNumber() {
    I.waitForContent('Their phone number (optional)', 60,'h1');
    //No Input here as this field is Optional and it will be entered by the Defendant
    I.clearField(paths.fields.telephone_number,{ force: true });
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmount() {
    I.waitForContent('Amount',60);
    I.see('Claim amount', 'h1');
    I.see('Your claim could be for a single amount or made up of multiple items.');
    I.see('Don’t include:');
    I.see('interest - we’ll ask you about this next');
    I.see('your claim fee - we’ll add this for you');
    I.see('What you’re claiming for?');
    I.see('Briefly explain each item - for example, "broken tiles", "roof damage"');
  }

  async verifyAndInputDoYouWantToClaimInterest(claimInterestFlag) {
    I.waitForContent('No', 60);
    I.see('Do you want to claim interest?', 'h1');
    I.see('You can claim interest on the money you say you\'re owed.');
    I.see('The court will decide if you\'re entitled to it.');
    I.see('Yes');
    if (claimInterestFlag === true) {
      I.click(paths.options.yes);
    } else {
      I.click(paths.options.no);
    }
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHowDoYouWantToClaimInterest() {
    I.waitForContent('Break down interest for different time periods or items',60);
    I.see('How do you want to claim interest?', 'h1');
    I.see('Same rate for the whole period');
    I.click(paths.options.same_rate_for_the_whole_period);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim() {
    I.waitForContent('A different rate', 60);
    I.see('What annual rate of interest do you want to claim?', 'h1');
    I.see('You can claim 8% per year unless you know that a different rate applies.:');
    I.click(paths.options.same_interest_rate_type);
    this.clickNextAction(paths.buttons.save_and_continue);
    I.waitForContent('When are you claiming interest from', 60);
    I.waitForElement(paths.options.date_that_you_submit_claim);
    I.click(paths.options.date_that_you_submit_claim);
  }

  async verifyAndInputWhenWillYouClaimInterestFrom() {
    I.waitForContent('For example the date an invoice was overdue or that you told someone they owed you the money.',60);
    I.see('When are you claiming interest from?', 'h1');
    I.see('The date you submit the claim');
    I.see('The interest will then be calculated up until the claim is settled or a Judgment has been made.');
    I.see('A particular date');
    I.click(paths.options.when_will_you_claim_interest_from);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHelpWithFees() {
    I.waitForContent('Yes', 60);
    I.see('Do you have a Help With Fees reference number?', 'h1');
    I.see('You\'ll only have one if you applied for Help With Fees.');
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
    I.click('Add another row');

    I.waitForContent('£ 1520.00',3);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmountSummary(claimInterestFlag) {
    I.waitForContent('There may be additional fees as your case progresses.',60);
    I.see('Total amount you’re claiming', 'h1');
    I.see('Claim amount');
    I.see('£1520.00');
    if (claimInterestFlag === true) {
      I.see('Interest to date');
      I.see('£0.00');
      I.seeElement(paths.links.how_is_interest_calculated);
    }
    I.see('Claim fee');
    I.see('£115');
    I.see('Total claim amount');
    I.see('£1635.00');
    I.see('If you settle out of court', 'h3');
    I.see('We won’t refund your claim fee.');
    I.see('You can ask the defendant to pay back your claim fee as part of the settlement.');
    I.see('Other fees');
    I.see('Hearing fee');
    I.see('£181');
    I.see('You don’t have to pay a hearing fee unless the claim goes to a hearing.');
    I.see('Find out more about court fees');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputClaimDetails() {
    I.waitForContent('You\'ll have to pay an extra fee if you want to change the details of the claim later.', 60);
    I.see('Briefly explain your claim', 'h1');
    I.see('Tell us why you believe the defendant owes you money.');
    I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    I.fillField(paths.fields.claim_details_text, 'Unprofessional Builder');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimDetailsTimeline() {
    I.waitForContent('Year',60);
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
    I.waitForContent('If your case goes to a court hearing, and is not settled, you will need to provide evidence.', 60);
    I.see('List your evidence', 'h1');
    I.see('List your evidence (optional)');
    I.see('Tell us about any evidence you wish to provide.');
    I.see('You do not need to send us any evidence now.');
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

  async verifyCheckYourAnswers(claimInterestFlag) {
    I.waitForContent('a false statement in a document verified by a statement of truth without an honest belief in its truth.', 60);
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

    I.see('Claim amount', 'h2');

    I.see('Broken bathroom');
    I.see('£1,000');
    I.see('Lost Tap');
    I.see('£100');
    I.see('Late Delivery');
    I.see('£400');

    if (claimInterestFlag === true) {
      I.see('Claim Interest');
      I.see('Yes');

      I.see('How do you want to claim interest?');
      I.see('Same rate for the whole period');

      I.see('What annual rate of interest do you want to claim?');
      I.see('8.00%');

      I.see('When are you claiming interest from?');
      I.see('The date you submit the claim');
    } else{
      I.see('Claim Interest');
      I.see('No');
    }

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
    I.see('The information on this page forms your claim.');
    I.see('You can see it on the claim form after you submit.');
    I.see('When you\'re satisfied that your answers are accurate,');
    I.see('I believe that the facts stated in this claim are true.');
    I.see('I understand that proceedings for contempt of court may be brought against anyone who makes,');
    I.see('or causes to be made,');

    I.uncheckOption(paths.fields.no_changes_allowed_declaration);
    I.uncheckOption(paths.fields.statement_of_truth);
    I.checkOption(paths.fields.no_changes_allowed_declaration);
    I.checkOption(paths.fields.statement_of_truth);
    I.click(paths.buttons.submit_claim);
  }

  async verifyClaimSubmitted(isHWFClaim = false) {
    I.waitForContent('Monday to Friday, 8.30am to 5pm.', 60);
    I.see('Claim submitted', 'h1');
    I.see('Claim number:');
    const claimReference = await I.grabTextFrom('//div[contains(text(),\'Claim number\')]/strong');
    I.see('What happens next', 'h2');
    if (isHWFClaim) {
      I.see('Your claim will be issued once your Help With Fees application has been confirmed. We\'ll email you within 5 days to confirm this.');
    } else {
      I.see('Your claim will not be issued and sent to the other parties until you have paid the claim fee.');
    }
    I.see('If the defendant pays you');
    I.see('You need to sign in to your account to tell us you\'ve been paid.');
    I.seeElement('//a[contains(text(),\'What did you think of this service?\')]');
    I.see('Email', 'h2');
    I.see('Telephone');
    I.see('0300 123 7050');
    I.seeElement('//a[.=\'Find out about call charges (opens in a new window)\']');
    return claimReference;
  }

  async verifyAndInputPayYourClaimFee(claimAmount, claimFee, interestAmount) {
    I.waitForContent('You can ask the defendant to pay back your claim fee as part of the settlement.', 60);
    I.see('Pay your claim fee', 'h1');
    I.see('Claim amount');
    I.see(claimAmount);
    I.see('Claim fee');
    I.see(claimFee);
    I.see('Total claim amount');
    I.see(claimAmount+claimFee+interestAmount);
    I.see('If you settle out of court we won\'t refund your claim fee.');
    await I.waitForText(`continue to payment(£${claimFee})`);
    await I.click('continue to payment');
  }

  async verifyAndInputCardDetails() {
    I.waitForContent('£115.00', 60);
    I.see('Enter card details', 'h1');
    I.see('Payment summary','h2');
    I.see('card payment');
    I.see('Total amount:');
    I.fillField('#card-no' ,'4444333322221111');
    I.fillField('#expiry-month' ,new Date().getMonth()+1);
    I.fillField('#expiry-year' ,new Date().getFullYear()+1);
    I.fillField('#cardholder-name','Test Name');
    I.fillField('#cvc', '444');
    I.fillField('[autocomplete=\'billing address-line1\']', '220 Helena House');
    I.fillField('#address-city','Swansea');
    I.fillField('#address-postcode','SA1 1XW');
    I.fillField('#email','testxxx@hmcts.net');
    await I.click('Continue');
  }
  async verifyConfirmYourPayment() {
    I.waitForContent('£115.00', 60);
    I.see('Confirm your payment','h1');
    I.see('Payment summary','h2');
    I.see('card payment');
    I.see('Total amount:');
    await I.click('Confirm payment');
  }

  async verifyYourPaymentWasSuccessfull() {
    I.waitForContent('£115', 60);
    I.see('Your payment was');
    I.see('successful');
    I.see('Your payment reference number is');
    I.see('You\'ll receive a confirmation email in the next hour.');
    I.see('Payment summary','h2');
    I.see('Payment for');
    I.see('Claim fee');
    I.see('Total amount');
    await I.click('Go to your account');
  }

  async signOut() {
    I.click('Sign out');
  }

  clickNextAction(action) {
    I.click(action);
  }

  async addClaimAmount(totalAmount, claimInterestFlag = false, standardInterest = true, selectHWF = false) {
    I.fillField(paths.fields.claim_amount_reason_1, 'Broken bathroom');
    I.fillField(paths.fields.claim_amount_amount_1, totalAmount);
    I.click('Add another row');
    this.clickNextAction(paths.buttons.save_and_continue);
    await this.answerClaimInterest(claimInterestFlag, standardInterest);
    await this.answerHWf(selectHWF);
    await I.waitForContent('Total claim amount', 60);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async answerClaimInterest(selectInterest = false, standardInterest = true) {
    if (selectInterest) {
      I.waitForContent('Do you want to claim interest', 60);
      I.click(paths.options.yes);
      this.clickNextAction(paths.buttons.save_and_continue);
      I.waitForContent('How do you want to claim interest', 60);
      if (standardInterest) {
        I.click(paths.options.same_rate_for_the_whole_period);
        this.clickNextAction(paths.buttons.save_and_continue);
        I.waitForContent('You can claim 8% per year unless you know that a different rate applies', 60);
        I.click(paths.options.same_interest_rate_type);
        this.clickNextAction(paths.buttons.save_and_continue);
        I.waitForElement(paths.options.date_that_you_submit_claim);
        I.click(paths.options.date_that_you_submit_claim);
      } else {
        I.click(paths.options.variable_interest_rate_type);
        this.clickNextAction(paths.buttons.save_and_continue);
        I.waitForContent('What is the total interest for your claim', 60);
        I.fillField(paths.options.interest_to_applied, 10);
        I.fillField(paths.options.interest_reason, 'calculate interest for the different time periods');
        // TODO: Uncomment this once below pages are enabled in claim creation disabled as part of CIV-15490
        // this.clickNextAction(paths.buttons.save_and_continue);
        // I.waitForContent('Continue to claim interest after you submit your claim', 60);
        // I.click(paths.options.yes);
        // this.clickNextAction(paths.buttons.save_and_continue);
        // I.waitForContent('How much do you want to continue claiming', 60);
        // I.click(paths.options.claim_specific_interest_after_submission);
        // I.fillField(paths.options.daily_interest_amount, '2');
      }
    } else {
      I.click(paths.options.no);
    }
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async answerHWf(selectHWF = false) {
    I.waitForContent('Do you have a Help With Fees reference number', 60);
    if (selectHWF) {
      I.click(paths.options.yes);
      await I.fillField(paths.fields.help_with_fees_reference_number, 'HWF-123-466');
    } else {
      I.click(paths.options.no);
    }
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillSoleTraderClaimantDetails() {
    await I.click(paths.options.sole_trader_claimant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.soleTraderTradingAs, 'Sole trader trading name');
    await this.selectAddress(true);
    this.inputDateOfBirth();
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillSoleTraderDefendantDetails() {
    await I.click(paths.options.sole_trader_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.soleTraderTradingAs, 'Defendant Sole trader trading name');
    await this.selectAddress(false);
    I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    this.clickNextAction(paths.buttons.save_and_continue);
    I.fillField(paths.fields.telephone_number, '07800000000');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillOrgClaimantDetails() {
    await I.click(paths.options.org_claimant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter organisation details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Claimant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Claimant contact name');
    await this.selectAddress(true);
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillOrgDefendantDetails() {
    await I.click(paths.options.org_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter organisation details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Defendant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Defendant contact name');
    await this.selectAddress(false);
    I.waitForText('This must be their personal email address', 60);
    I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    this.clickNextAction(paths.buttons.save_and_continue);
    I.fillField(paths.fields.telephone_number, '07800000000');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillCompanyClaimantDetails() {
    await I.click(paths.options.limited_company_claimant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Company details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Claimant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Claimant contact name');
    await this.selectAddress(true);
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillCompanyDefendantDetails() {
    await I.click(paths.options.limited_company_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Are you claming for a delayed flight?', 60);
    I.click(paths.options.yes);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter flight details', 60);
    await I.fillField('airline', 'Aegean');
    await I.fillField('flightNumber', '012345');
    await I.fillField('#day', '01');
    await I.fillField('#month', '01');
    await I.fillField('#year', '2020');
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Company details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Defendant Company name');
    await I.fillField(paths.fields.OrgContactPerson, 'Defendant Company name');
    await this.selectAddress(false);
    I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    this.clickNextAction(paths.buttons.save_and_continue);
    I.fillField(paths.fields.telephone_number, '07800000000');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async checkAndSubmit(selectedHWF = false, claimantPartyType = 'Individual') {
    await I.click('Check and submit your claim');
    I.waitForContent('a false statement in a document verified by a statement of truth without an honest belief in its truth', 60);
    if (!selectedHWF) {
      I.uncheckOption(paths.fields.no_changes_allowed_declaration);
      I.checkOption(paths.fields.no_changes_allowed_declaration);
    }
    if (claimantPartyType == 'Company' || claimantPartyType == 'Org' ) {
      I.fillField(paths.fields.signerName, 'signer claimant name');
      I.fillField(paths.fields.signerRole, 'signer claimant role');
    }
    I.uncheckOption(paths.fields.statement_of_truth);
    I.checkOption(paths.fields.statement_of_truth);
    I.click(paths.buttons.submit_claim);
    await I.waitForContent('Claim submitted', 60);
    const caseReference = await this.verifyClaimSubmitted(selectedHWF);
    return caseReference;
  }
}

module.exports = CreateClaim;
