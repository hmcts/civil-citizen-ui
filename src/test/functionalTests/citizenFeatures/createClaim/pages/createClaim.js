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
    await I.waitForContent('In what language do you want to make your claim?', 60, 'h4');
    await I.see('Language', 'h1');
    await I.see('You must choose which language you want to use to make this claim.');
    await I.see('If you select \'Welsh\', information and documents will be presented in Welsh.');
    await I.see('But some notifications about your claim will still be in English.');
    await I.click('#option'); //English
    await I.click('Save and continue');
  }

  async verifyDashboard() {
    await I.waitForContent('Submit', 60, 'h2');
    await I.see('Application complete', 'h2');
    await I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    await I.see('Consider other options', 'h2');
    await I.see('Prepare your claim', 'h2');
  }

  async verifyTryToResolveTheDispute() {
    await I.waitForContent('explaining you\'ll make a claim against them if they don\'t follow your timetable',60);
    await I.see('Try to resolve the dispute', 'h1');
    await I.see('Before you claim you should:');
    await I.see('talk to the person or organisation you want to claim against');
    await I.see('consider mediation');
    await I.see('Talk to the person or organisation', 'h2');
    await I.see('Try to resolve the dispute by:');
    await I.see('telling them why you intend to make a claim against them');
    await I.see('suggesting timetable with actions you want them to take');
    await this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
  }

  async verifyCompletingYourClaim() {
    await I.waitForContent('add information that significantly changes your claim',60);
    await I.see('Get the details right', 'h1');
    // I.see('You\'ll have to pay an additional fee if you want you:');
    await I.see('change the name of anyone involved with the claim');
    await I.see('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
    await this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
  }

  async verifyAboutYouAndThisClaimForClaimant() {
    await I.waitForContent('For example a partnership, trust, charity, club or association',60);
    await I.see('About you and this claim', 'h1');
    await I.see('I\'m claiming as:');
    await I.see('An individual');
    await I.see('You\'re claiming for yourself');
    await I.see('A sole trader or self-employed person');
    await I.see('For example a tradesperson');
    await I.see('A limited company');
    await I.see('For example a company that sells goods or services');
    await I.see('Another type of organisation');
    await I.click(paths.options.individual_claimant);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAboutYouAndThisClaimForDefendant() {
    await I.waitForContent('For example a partnership, trust, charity, club or association', 60);
    await I.see('Who are you making the claim against?', 'h1');
    await I.see('An individual');
    await I.see('For example someone you lent money to');
    await I.see('For example a tradesperson who did work for you');
    await I.see('For example a tradesperson');
    await I.see('A limited company');
    await I.see('For example a company that sold you goods or services');
    await I.see('Another type of organisation');
    await I.click(paths.options.individual_defendant);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyEnterYourDetails() {
    await I.waitForContent('Yes, add a correspondence address', 60);
    await I.see('Enter your details', 'h1');
    await I.see('These details are shared with the person, business or organisation you are claiming from (the defendant).');
    await I.see('Title');
    await I.see('First name');
    await I.see('Last name');
    await I.see('Your postal address', 'h2');
    await I.see('If your address is not correct you can change it here.');
    await I.see('Any changes will be shared with the claimant when you submit your response.');
    await I.see('Enter a UK postcode');
    await I.see('Correspondence address', 'h2');
    await I.see('Would you like correspondence sent to a different address?');
    await I.see('No');
  }

  async verifyEnterDefendantsDetails() {
    await I.waitForContent('Enter a UK postcode', 60);
    await I.see('Enter the defendant’s details', 'h1');
    await I.see('You’ll have to pay extra fee if you later want to change the name of anyone involved with the claim.');
    await I.see('Title');
    await I.see('First name');
    await I.see('Last name');
    await I.see('Their address', 'h2');
    await I.see('The address must be in England or Wales.');
    await I.see('Your claim may be invalid if you use the wrong address.');
    await I.see('You must enter their usual or last known home address.');
    await I.see('You cannot use their work address.');
  }

  async inputEnterYourDetails(claimantFlag) {
    if (claimantFlag === true) {
      await I.fillField(paths.fields.individual_title, 'Mr');
      await I.fillField(paths.fields.individual_first_name, 'Joe');
      await I.fillField(paths.fields.individual_last_name, 'Bloggs');
    } else if (claimantFlag === false) {
      await I.fillField(paths.fields.individual_title, 'Mrs');
      await I.fillField(paths.fields.individual_first_name, 'Jane');
      await I.fillField(paths.fields.individual_last_name, 'Doe');
    }
    await this.selectAddress(claimantFlag);
  }

  async selectAddress(claimantFlag) {
    const isPlaywrightActive = await I.isPlaywright();
    await I.fillField(paths.buttons.find_address_field, 'MK5 7HH');
    await this.clickNextAction('Find address');
    await I.wait(2);
    await I.waitForVisible('#primaryAddresspostcodeAddress', 3);
    await I.see('Pick an address');
    if (!isPlaywrightActive) {
      await I.waitForClickable('#primaryAddresspostcodeAddress', 30);
    }
    if (claimantFlag === true) {
      await I.selectOption('#primaryAddresspostcodeAddress',
        'THE COMMUNITY CENTRE, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    } else if (claimantFlag === false) {
      await I.selectOption('#primaryAddresspostcodeAddress',
        'ARCANA, 54, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    }
    await I.wait(2);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyDateOfBirth() {
    await I.waitForContent('Year', 60);
    await I.see('What is your date of birth?', 'h1');
    await I.see('Day');
    await I.see('Month');
  }

  async inputDateOfBirth() {
    await I.fillField('#day', '01');
    await I.fillField('#month', '06');
    await I.fillField('#year', '1975');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputPhoneNumber() {
    await I.waitForContent('We\'ll also give your number to the person, business, or organisation you are claiming from.', 60);
    await I.see('Enter a phone number', 'h1');
    await I.see('We might need to speak to you about this claim.');
    await I.see('We’ll only call on weekdays between 9am and 5pm.');
    await I.fillField(paths.fields.telephone_number, '07818731017');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirEmailAddress() {
    await I.waitForContent('This must be their personal email address', 60);
    await I.see('Their email address (optional)', 'h1');
    await I.see('We\'ll use this to tell them you\'ve made a claim, as well as notifying them by post.');
    await I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirPhoneNumber() {
    await I.waitForContent('Their phone number (optional)', 60,'h1');
    //No Input here as this field is Optional and it will be entered by the Defendant
    await I.clearField(paths.fields.telephone_number,{ force: true });
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmount() {
    await I.waitForContent('Amount',60);
    await I.see('Claim amount', 'h1');
    await I.see('Your claim could be for a single amount or made up of multiple items.');
    await I.see('Don’t include:');
    await I.see('interest - we’ll ask you about this next');
    await I.see('your claim fee - we’ll add this for you');
    await I.see('What you’re claiming for?');
    await I.see('Briefly explain each item - for example, "broken tiles", "roof damage"');
  }

  async verifyAndInputDoYouWantToClaimInterest(claimInterestFlag) {
    await I.waitForContent('No', 60);
    await I.see('Do you want to claim interest?', 'h1');
    await I.see('You can claim interest on the money you say you\'re owed.');
    await I.see('The court will decide if you\'re entitled to it.');
    await I.see('Yes');
    if (claimInterestFlag === true) {
      await I.click(paths.options.yes);
    } else {
      await I.click(paths.options.no);
    }
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHowDoYouWantToClaimInterest() {
    await I.waitForContent('Break down interest for different time periods or items',60);
    await I.see('How do you want to claim interest?', 'h1');
    await I.see('Same rate for the whole period');
    await I.click(paths.options.same_rate_for_the_whole_period);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim() {
    await I.waitForContent('A different rate', 60);
    await I.see('What annual rate of interest do you want to claim?', 'h1');
    await I.see('You can claim 8% per year unless you know that a different rate applies.:');
    await I.click(paths.options.same_interest_rate_type);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('When are you claiming interest from', 60);
    await I.waitForElement(paths.options.date_that_you_submit_claim);
    await I.click(paths.options.date_that_you_submit_claim);
  }

  async verifyAndInputWhenWillYouClaimInterestFrom() {
    await I.waitForContent('For example the date an invoice was overdue or that you told someone they owed you the money.',60);
    await I.see('When are you claiming interest from?', 'h1');
    await I.see('The date you submit the claim');
    await I.see('The interest will then be calculated up until the claim is settled or a Judgment has been made.');
    await I.see('A particular date');
    await I.click(paths.options.when_will_you_claim_interest_from);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHelpWithFees() {
    await I.waitForContent('Yes', 60);
    await I.see('Do you have a Help With Fees reference number?', 'h1');
    await I.see('You\'ll only have one if you applied for Help With Fees.');
    await I.click(paths.options.no);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async inputClaimAmount() {
    await I.fillField(paths.fields.claim_amount_reason_1, 'Broken bathroom');
    await I.fillField(paths.fields.claim_amount_amount_1, '1000');

    await I.fillField(paths.fields.claim_amount_reason_2, 'Lost Tap');
    await I.fillField(paths.fields.claim_amount_amount_2, '100');

    await I.fillField(paths.fields.claim_amount_reason_3, 'Late Delivery');
    await I.fillField(paths.fields.claim_amount_amount_3, '400');

    await I.fillField(paths.fields.claim_amount_reason_4, 'Temporary Entry for Automation Blur');
    await I.fillField(paths.fields.claim_amount_amount_4, '20.00');
    await I.click('Add another row');

    await I.waitForContent('£ 1520.00',3);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmountSummary(claimInterestFlag) {
    await I.waitForContent('There may be additional fees as your case progresses.',60);
    await I.see('Total amount you’re claiming', 'h1');
    await I.see('Claim amount');
    await I.see('£1520.00');
    if (claimInterestFlag === true) {
      await I.see('Interest to date');
      await I.see('£0.00');
      await I.seeElement(paths.links.how_is_interest_calculated);
    }
    await I.see('Claim fee');
    await I.see('£115');
    await I.see('Total claim amount');
    await I.see('£1635.00');
    await I.see('If you settle out of court', 'h3');
    await I.see('We won’t refund your claim fee.');
    await I.see('You can ask the defendant to pay back your claim fee as part of the settlement.');
    await I.see('Other fees');
    await I.see('Hearing fee');
    await I.see('£181');
    await I.see('You don’t have to pay a hearing fee unless the claim goes to a hearing.');
    await I.see('Find out more about court fees');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputClaimDetails() {
    await I.waitForContent('You\'ll have to pay an extra fee if you want to change the details of the claim later.', 60);
    await I.see('Briefly explain your claim', 'h1');
    await I.see('Tell us why you believe the defendant owes you money.');
    await I.see('Don\'t give us a detailed timeline - we\'ll ask for that separately.');
    await I.fillField(paths.fields.claim_details_text, 'Unprofessional Builder');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimDetailsTimeline() {
    await I.waitForContent('Year',60);
    await I.see('Timeline of events', 'h1');
    await I.see('If you don’t know exact date, tell us the month and year');
    await I.see('Example timeline', 'h2');
    await I.see('12 November 2023 - John Smith gave me a quote to replace the roof.');
    await I.see('14 November 2023 - We agreed and signed a contract for the work.');
    await I.see('12 December 2023 - I noticed a leak on the landing and told Mr Smith about this.');
    await I.see('Date');
    await I.see('What happened');
    await I.see('For example, you might have signed a contract');
    await I.see('Day');
    await I.see('Month');
  }

  async inputClaimDetailsTimeline() {
    await I.fillField(paths.fields.timeline_row_0_day, '01');
    await I.fillField(paths.fields.timeline_row_0_month, '06');
    await I.fillField(paths.fields.timeline_row_0_year, '1975');
    await I.fillField(paths.fields.timeline_row_0_description, 'Drafting of Contracts');

    await I.fillField(paths.fields.timeline_row_1_day, '10');
    await I.fillField(paths.fields.timeline_row_1_month, '06');
    await I.fillField(paths.fields.timeline_row_1_year, '1975');
    await I.fillField(paths.fields.timeline_row_1_description, 'Work Begins');

    await I.fillField(paths.fields.timeline_row_2_day, '15');
    await I.fillField(paths.fields.timeline_row_2_month, '06');
    await I.fillField(paths.fields.timeline_row_2_year, '1975');
    await I.fillField(paths.fields.timeline_row_2_description, 'Loss of the tap');

    await I.fillField(paths.fields.timeline_row_3_day, '20');
    await I.fillField(paths.fields.timeline_row_3_month, '06');
    await I.fillField(paths.fields.timeline_row_3_year, '1975');
    await I.fillField(paths.fields.timeline_row_3_description, 'Work not delivered and bathroom broken.Dispute with the Builder');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyListEvidence() {
    await I.waitForContent('If your case goes to a court hearing, and is not settled, you will need to provide evidence.', 60);
    await I.see('List your evidence', 'h1');
    await I.see('List your evidence (optional)');
    await I.see('Tell us about any evidence you wish to provide.');
    await I.see('You do not need to send us any evidence now.');
  }

  async inputEvidenceList() {
    await I.selectOption(paths.fields.evidence_list_1,
      'Contracts and agreements');
    await I.fillField(paths.fields.evidence_list_description_1, 'Signed Contract');
    await I.selectOption(paths.fields.evidence_list_2,
      'Receipts');
    await I.fillField(paths.fields.evidence_list_description_2, 'Expenses Receipt');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async rerouteFromEqualityAndDiversity(checkAndSubmitClaim) {
    let url = await I.grabCurrentUrl();
    //Check if PCQ page appears
    if (url.includes('pcq')) {
      await I.amOnPage('/claim/task-list');
      await I.click(checkAndSubmitClaim);
    }
  }

  async verifyCheckYourAnswers(claimInterestFlag) {
    await I.waitForContent('a false statement in a document verified by a statement of truth without an honest belief in its truth.', 60);
    await I.see('Check your answers', 'h1');

    await I.see('Your details (claimant)', 'h2');

    await I.see('Full name');
    await I.see('Mr Joe Bloggs');

    await I.see('Address');
    await I.see('THE COMMUNITY CENTRE');
    await I.see('MILTON KEYNES');
    await I.see('MK5 7HH');

    await I.see('Correspondence address');

    await I.see('Date of birth');
    await I.see('1 June 1975');

    await I.see('Contact number (optional)');
    await I.see('07818731017');

    await I.see('Their details (defendant)');
    await I.see('Full name');
    await I.see('Mrs Jane Doe');

    await I.see('ARCANA');
    await I.see('MILTON KEYNES');
    await I.see('MK5 7HH');

    await I.see('Same as address');

    await I.see('Email');
    await I.see('civilmoneyclaimsdemo@gmail.com');

    await I.see('Claim amount', 'h2');

    await I.see('Broken bathroom');
    await I.see('£1,000');
    await I.see('Lost Tap');
    await I.see('£100');
    await I.see('Late Delivery');
    await I.see('£400');

    if (claimInterestFlag === true) {
      await I.see('Claim Interest');
      await I.see('Yes');

      await I.see('How do you want to claim interest?');
      await I.see('Same rate for the whole period');

      await I.see('What annual rate of interest do you want to claim?');
      await I.see('8.00%');

      await I.see('When are you claiming interest from?');
      await I.see('The date you submit the claim');
    } else{
      await I.see('Claim Interest');
      await I.see('No');
    }

    await I.see('Claim Details');
    await I.see('Unprofessional Builder');

    await I.see('Timeline of what happened');
    await I.see('1 June 1975');
    await I.see('Drafting of Contracts');
    await I.see('10 June 1975');
    await I.see('Work Begins');
    await I.see('15 June 1975');
    await I.see('Loss of the tap');
    await I.see('20 June 1975');
    await I.see('Work not delivered and bathroom broken.Dispute with the Builder');

    await I.see('Your evidence (optional)');
    await I.see('Signed Contract');
    await I.see('Contracts and agreements');
    await I.see('Receipts');
    await I.see('Expenses Receipt');

    await I.see('Statement of truth');
    await I.see('The information on this page forms your claim.');
    await I.see('You can see it on the claim form after you submit.');
    await I.see('When you\'re satisfied that your answers are accurate,');
    await I.see('I believe that the facts stated in this claim are true.');
    await I.see('I understand that proceedings for contempt of court may be brought against anyone who makes,');
    await I.see('or causes to be made,');

    await I.uncheckOption(paths.fields.no_changes_allowed_declaration);
    await I.uncheckOption(paths.fields.statement_of_truth);
    await I.checkOption(paths.fields.no_changes_allowed_declaration);
    await I.checkOption(paths.fields.statement_of_truth);
    await I.click(paths.buttons.submit_claim);
  }

  async verifyClaimSubmitted(isHWFClaim = false) {
    await I.waitForContent('Monday to Friday, 8.30am to 5pm.', 60);
    await I.see('Claim submitted', 'h1');
    await I.see('Claim number:');
    const claimReference = await I.grabTextFrom('//div[contains(text(),\'Claim number\')]/strong');
    await I.see('What happens next', 'h2');
    if (isHWFClaim) {
      await I.see('Your claim will be issued once your Help With Fees application has been confirmed. We\'ll email you within 5 days to confirm this.');
    } else {
      await I.see('Your claim will not be issued and sent to the other parties until you have paid the claim fee.');
    }
    await I.see('If the defendant pays you');
    await I.see('You need to sign in to your account to tell us you\'ve been paid.');
    await I.seeElement('//a[contains(text(),\'What did you think of this service?\')]');
    await I.see('Email', 'h2');
    await I.see('Telephone');
    await I.see('0300 123 7050');
    await I.seeElement('//a[.=\'Find out about call charges (opens in a new tab)\']');
    return claimReference;
  }

  async verifyAndInputPayYourClaimFee(claimAmount, claimFee, interestAmount) {
    await I.waitForContent('You can ask the defendant to pay back your claim fee as part of the settlement.', 60);
    await I.see('Pay your claim fee', 'h1');
    await I.see('Claim amount');
    await I.see(claimAmount);
    await I.see('Claim fee');
    await I.see(claimFee);
    await I.see('Total claim amount');
    await I.see(claimAmount+claimFee+interestAmount);
    await I.see('If you settle out of court we won\'t refund your claim fee.');
    await I.waitForText(`continue to payment(£${claimFee})`);
    await I.click('continue to payment');
  }

  async verifyAndInputCardDetails() {
    await I.waitForContent('£115.00', 60);
    await I.see('Enter card details', 'h1');
    await I.see('Payment summary','h2');
    await I.see('card payment');
    await I.see('Total amount:');
    await I.fillField('#card-no' ,'4444333322221111');
    await I.fillField('#expiry-month' ,new Date().getMonth()+1);
    await I.fillField('#expiry-year' ,new Date().getFullYear()+1);
    await I.fillField('#cardholder-name','Test Name');
    await I.fillField('#cvc', '444');
    await I.fillField('[autocomplete=\'billing address-line1\']', '220 Helena House');
    await I.fillField('#address-city','Swansea');
    await I.fillField('#address-postcode','SA1 1XW');
    await I.fillField('#email','testxxx@hmcts.net');
    await I.click('Continue');
  }
  async verifyConfirmYourPayment() {
    await I.waitForContent('£115.00', 60);
    await I.see('Confirm your payment','h1');
    await I.see('Payment summary','h2');
    await I.see('card payment');
    await I.see('Total amount:');
    await I.click('Confirm payment');
  }

  async verifyYourPaymentWasSuccessfull() {
    await I.waitForContent('£115', 60);
    await I.see('Your payment was');
    await I.see('successful');
    await I.see('Your payment reference number is');
    await I.see('You\'ll receive a confirmation email in the next hour.');
    await I.see('Payment summary','h2');
    await I.see('Payment for');
    await I.see('Claim fee');
    await I.see('Total amount');
    await I.click('Go to your account');
  }

  async signOut() {
    await I.click('Sign out');
  }

  async clickNextAction(action) {
    await I.click(action);
  }

  async addClaimAmount(totalAmount, claimInterestFlag = false, standardInterest = true, selectHWF = false) {
    await I.fillField(paths.fields.claim_amount_reason_1, 'Broken bathroom');
    await I.fillField(paths.fields.claim_amount_amount_1, totalAmount);
    await I.click('Add another row');
    await this.clickNextAction(paths.buttons.save_and_continue);
    await this.answerClaimInterest(claimInterestFlag, standardInterest);
    await this.answerHWf(selectHWF);
    await I.waitForContent('Total claim amount', 60);
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async answerClaimInterest(selectInterest = false, standardInterest = true) {
    if (selectInterest) {
      await I.waitForContent('Do you want to claim interest', 60);
      await I.click(paths.options.yes);
      await this.clickNextAction(paths.buttons.save_and_continue);
      await I.waitForContent('How do you want to claim interest', 60);
      if (standardInterest) {
        await I.click(paths.options.same_rate_for_the_whole_period);
        await this.clickNextAction(paths.buttons.save_and_continue);
        await I.waitForContent('You can claim 8% per year unless you know that a different rate applies', 60);
        await I.click(paths.options.same_interest_rate_type);
        await this.clickNextAction(paths.buttons.save_and_continue);
        await I.waitForElement(paths.options.date_that_you_submit_claim);
        await I.click(paths.options.date_that_you_submit_claim);
      } else {
        await I.click(paths.options.variable_interest_rate_type);
        await this.clickNextAction(paths.buttons.save_and_continue);
        await I.waitForContent('What is the total interest for your claim', 60);
        await I.fillField(paths.options.interest_to_applied, 10);
        await I.fillField(paths.options.interest_reason, 'calculate interest for the different time periods');
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
      await I.click(paths.options.no);
    }
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async answerHWf(selectHWF = false) {
    await I.waitForContent('Do you have a Help With Fees reference number', 60);
    if (selectHWF) {
      await I.click(paths.options.yes);
      await I.fillField(paths.fields.help_with_fees_reference_number, 'HWF-123-466');
    } else {
      await I.click(paths.options.no);
    }
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillSoleTraderClaimantDetails() {
    await I.click(paths.options.sole_trader_claimant);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.soleTraderTradingAs, 'Sole trader trading name');
    await this.selectAddress(true);
    await this.inputDateOfBirth();
    await I.fillField(paths.fields.telephone_number, '07818731017');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillSoleTraderDefendantDetails() {
    await I.click(paths.options.sole_trader_defendant);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.soleTraderTradingAs, 'Defendant Sole trader trading name');
    await this.selectAddress(false);
    await I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.telephone_number, '07800000000');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillOrgClaimantDetails() {
    await await I.click(paths.options.org_claimant);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter organisation details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Claimant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Claimant contact name');
    await this.selectAddress(true);
    await I.fillField(paths.fields.telephone_number, '07818731017');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillOrgDefendantDetails() {
    await I.click(paths.options.org_defendant);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter organisation details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Defendant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Defendant contact name');
    await this.selectAddress(false);
    await I.waitForText('This must be their personal email address', 60);
    await I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.telephone_number, '07800000000');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillCompanyClaimantDetails() {
    await I.click(paths.options.limited_company_claimant);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Company details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Claimant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Claimant contact name');
    await this.selectAddress(true);
    await I.fillField(paths.fields.telephone_number, '07818731017');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillCompanyDefendantDetails() {
    await I.click(paths.options.limited_company_defendant);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Are you claming for a delayed flight?', 60);
    await I.click(paths.options.yes);
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter flight details', 60);
    await I.fillField('airline', 'Aegean');
    await I.fillField('flightNumber', '012345');
    await I.fillField('#day', '01');
    await I.fillField('#month', '01');
    await I.fillField('#year', '2020');
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Company details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Defendant Company name');
    await I.fillField(paths.fields.OrgContactPerson, 'Defendant Company name');
    await this.selectAddress(false);
    await I.fillField(paths.fields.email_address, 'civilmoneyclaimsdemo@gmail.com');
    await this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.telephone_number, '07800000000');
    await this.clickNextAction(paths.buttons.save_and_continue);
  }

  async checkAndSubmit(selectedHWF = false, claimantPartyType = 'Individual') {
    await I.click('Check and submit your claim');
    await I.waitForContent('a false statement in a document verified by a statement of truth without an honest belief in its truth', 60);
    if (!selectedHWF) {
      await I.uncheckOption(paths.fields.no_changes_allowed_declaration);
      await I.checkOption(paths.fields.no_changes_allowed_declaration);
    }
    if (claimantPartyType == 'Company' || claimantPartyType == 'Org' ) {
      await I.fillField(paths.fields.signerName, 'signer claimant name');
      await I.fillField(paths.fields.signerRole, 'signer claimant role');
    }
    await I.uncheckOption(paths.fields.statement_of_truth);
    await I.checkOption(paths.fields.statement_of_truth);
    await I.click(paths.buttons.submit_claim);
    await I.waitForContent('Claim submitted', 60);
    const caseReference = await this.verifyClaimSubmitted(selectedHWF);
    return caseReference;
  }
}

module.exports = CreateClaim;
