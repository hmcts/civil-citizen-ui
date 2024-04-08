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
    find_address_field: '//input[@id=\'address[postcodeLookup]\']',
    submit_claim: 'Submit and continue to payment (£70)',
  },
  options: {
    individual_claimant: '#typeindividual',
    sole_trader_claimant: '#claimantPartyType-2',
    limited_company_claimant: '#claimantPartyType-3',
    org_claimant: '#claimantPartyType-4',
    individual_defendant: '#typeindividual',
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
    telephone_number: '#number',
    soleTraderTradingAs: '#soleTraderTradingAs',
    OrgpartyName: 'partyName',
    OrgContactPerson: 'contactPerson',
    email_address: '#address',
    claim_amount_reason_1: '//input[@id=\'rows[0][reason]\']',
    claim_amount_amount_1: '//input[@id=\'rows[0][amount]\']',
    claim_amount_reason_2: '(//input[@id=\'claimAmountRows[1][reason]\'])[1]',
    claim_amount_amount_2: '(//input[@id=\'claimAmountRows[1][amount]\'])[1]',
    claim_amount_reason_3: '(//input[@id=\'claimAmountRows[2][reason]\'])[1]',
    claim_amount_amount_3: '(//input[@id=\'claimAmountRows[2][amount]\'])[1]',
    claim_amount_reason_4: '(//input[@id=\'claimAmountRows[3][reason]\'])[1]',
    claim_amount_amount_4: '(//input[@id=\'claimAmountRows[3][amount]\'])[1]',
    help_with_fees_reference_number: '#referenceNumber',
    claim_details_text: '#reason',

    timeline_row_0_date: '//input[@id=\'rows[0][date]\']',
    timeline_row_0_description: '//textarea[@id=\'rows[0][description]\']',
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
    statement_of_truth: '#signedtrue',
    no_changes_allowed_declaration: '#acceptNoChangesAllowed',
    signerName: '#signerName',
    signerRole:'#signerRole',
  },
};

class CreateClaimOCMC {

  async verifyDashboard() {
    I.waitForContent('Submit', 60, 'h2');
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
    I.click('.button');
  }

  async verifyCompletingYourClaim() {
    I.waitForContent('add information that significantly change your claim',60);
    I.see('Get the details right', 'h1');
    I.see('change the name of anyone involved with the claim');
    I.see('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
    I.click('.button');
  }

    verifyAboutYouAndThisClaimForClaimant() {
    I.waitForContent('For example a partnership, trust, charity, club or association',60);
    I.see('About you and this claim', 'h1');
    I.see('An individual');
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
    I.see('Correspondence address', 'h2');
    I.see('Would you like correspondence sent to a different address?');
    I.see('No');
  }

  verifyEnterDefendantsDetails() {
    I.waitForContent('Enter a UK postcode', 60);

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
    this.selectAddress(claimantFlag);
  }

  selectAddress(claimantFlag) {
    I.fillField(paths.buttons.find_address_field, 'MK5 7HH');
    I.click('Find address');
    I.wait(2);
    I.see('Pick an address');
    if (claimantFlag === true) {
      I.selectOption('Pick an address','THE COMMUNITY CENTRE, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    } else if (claimantFlag === false) {
      I.selectOption('Pick an address','ARCANA, 54, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    }
    I.wait(2);
    if(claimantFlag) { I.click('#hasCorrespondenceAddressfalse')}
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyDateOfBirth() {
    I.waitForContent('Year', 60);
    I.see('What is your date of birth?', 'h1');
    I.see('Day');
    I.see('Month');
  }

  inputDateOfBirth() {
    I.fillField('Day', '01');
    I.fillField('Month', '06');
    I.fillField('Year', '1975');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputPhoneNumber() {
    I.waitForContent('We\'ll also give your number to the person, business, or organisation you are claiming from.', 60);
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyTheirEmailAddress() {
    I.waitForContent('This must be their personal email address', 60);
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
    I.waitForContent('Claim amount',60);
  }

  async verifyAndInputDoYouWantToClaimInterest(claimInterestFlag) {
    I.waitForContent('No', 60);
    I.see('Yes');
    I.click(paths.options.no);
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
    I.click(paths.options.when_will_you_claim_interest_from);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputHelpWithFees() {
    I.waitForContent('Yes', 60);
    I.click(paths.options.no);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async inputClaimAmount() {
    I.fillField(paths.fields.claim_amount_reason_1, 'Broken bathroom');
    I.fillField(paths.fields.claim_amount_amount_1, '1000');

    I.waitForContent('£1,000.00',3);
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimAmountSummary() {
    I.waitForContent('There may be additional fees as your case progresses.',60);
    I.see('£1,070');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyAndInputClaimDetails() {
    I.waitForContent('You\'ll have to pay an extra fee if you want to change the details of the claim later.', 60);
    I.fillField(paths.fields.claim_details_text, 'Unprofessional Builder');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async verifyClaimDetailsTimeline() {
    I.waitForContent('What happened',60);
  }

  async inputClaimDetailsTimeline() {
    I.fillField(paths.fields.timeline_row_0_date, '01/06/1975');
    I.fillField(paths.fields.timeline_row_0_description, 'Drafting of Contracts');

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
    I.waitForContent('If your case goes to a court hearing, and is not settled, you will need to provide evidence.', 60);
    this.clickNextAction(paths.buttons.save_and_continue);
    I.click('I don\'t want to answer these questions')
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
    I.see('Email', 'h3');
    I.see('Telephone');
    I.see('0300 123 7050');
    I.seeElement('//a[.=\'Find out about call charges (opens in a new window)\']');
    return claimReference;
  }

  async verifyAndInputPayYourClaimFee(claimAmount, claimFee) {
    I.waitForContent('You can ask the defendant to pay back your claim fee as part of the settlement.', 60);
    I.see('Pay your claim fee', 'h1');
    I.see('Claim amount');
    I.see(claimAmount);
    I.see('Claim fee');
    I.see(claimFee);
    I.see('Total claim amount');
    I.see(claimAmount+claimFee);
    I.see('If you settle out of court we won\'t refund your claim fee.');
    await I.click(`continue to payment(£${claimFee})`);
  }

  async verifyAndInputCardDetails() {
    I.waitForContent('£115.00', 60);
    I.see('Enter card details', 'h1');
    I.see('Payment summary','h2');
    I.see('card payment');
    I.see('Total amount:');
    I.fillField('#card-no' ,'4444333322221111');
    I.fillField('#expiry-month' ,new Date().getMonth());
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
    I.see('Payment summary','h3');
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
    if (selectInterest == true) {
      I.waitForContent('Do you want to claim interest', 60);
      I.click(paths.options.yes);
      this.clickNextAction(paths.buttons.save_and_continue);
      I.waitForContent('How do you want to claim interest', 60);
      if (standardInterest == true) { 
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
        this.clickNextAction(paths.buttons.save_and_continue);
        I.waitForContent('Continue to claim interest after you submit your claim', 60);
        I.click(paths.options.yes);
        this.clickNextAction(paths.buttons.save_and_continue);
        I.waitForContent('How much do you want to continue claiming', 60);
        I.click(paths.options.claim_specific_interest_after_submission);
        I.fillField(paths.options.daily_interest_amount, '2');
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
    this.selectAddress(true);
    this.inputDateOfBirth();
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillSoleTraderDefendantDetails() {
    await I.click(paths.options.sole_trader_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.fillField(paths.fields.soleTraderTradingAs, 'Defendant Sole trader trading name');
    this.selectAddress(false);
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
    this.selectAddress(true);
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillOrgDefendantDetails() {
    await I.click(paths.options.org_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Enter organisation details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Defendant Org name');
    await I.fillField(paths.fields.OrgContactPerson, 'Defendant contact name');
    this.selectAddress(false);
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
    this.selectAddress(true);
    I.fillField(paths.fields.telephone_number, '07818731017');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async fillCompanyDefendantDetails() {
    await I.click(paths.options.limited_company_defendant);
    this.clickNextAction(paths.buttons.save_and_continue);
    await I.waitForContent('Company details', 60);
    await I.fillField(paths.fields.OrgpartyName, 'Defendant Company name');
    await I.fillField(paths.fields.OrgContactPerson, 'Defendant Company name');
    this.selectAddress(false);
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

module.exports = CreateClaimOCMC;
