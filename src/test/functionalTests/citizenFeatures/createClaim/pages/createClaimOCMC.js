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
    I.waitForContent('add information that significantly changes your claim',60);
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

  selectAddress() {
    I.fillField(paths.buttons.find_address_field, 'MK5 7HH');
    I.click('Find address');
    I.wait(2);
    I.see('Pick an address');
    I.selectOption('Pick an address','ARCANA, 54, EGERTON GATE, SHENLEY BROOK END, MILTON KEYNES, MK5 7HH');
    I.wait(2);
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

  async verifyAndInputDoYouWantToClaimInterest() {
    I.waitForContent('No', 60);
    I.see('Yes');
    I.click(paths.options.no);
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

  async inputClaimDetailsTimeline() {
    I.fillField(paths.fields.timeline_row_0_date, '01/06/1975');
    I.fillField(paths.fields.timeline_row_0_description, 'Drafting of Contracts');

    this.clickNextAction(paths.buttons.save_and_continue);
  }

  async inputEvidenceList() {
    I.waitForContent('If your case goes to a court hearing, and is not settled, you will need to provide evidence.', 60);
    this.clickNextAction(paths.buttons.save_and_continue);
    I.click('I don\'t want to answer these questions');
  }

  async verifyCheckYourAnswers() {
    I.waitForContent('a false statement in a document verified by a statement of truth without an honest belief in its truth.', 60);

    I.checkOption(paths.fields.statement_of_truth);
    I.click(paths.buttons.submit_claim);
  }

  async verifyClaimSubmitted() {
    I.waitForContent('Monday to Friday, 8.30am to 5pm.', 60);
    I.see('Claim submitted', 'h1');
    I.see('Your claim number:');
    const claimReference = await I.grabTextFrom('h1.bold-large:nth-child(2)');
    I.see('What happens next', 'h2');
    return claimReference;
  }

  clickNextAction(action) {
    I.click(action);
  }

  async payClaimFee() {
    I.waitForContent('Enter card details', 60);
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
    I.waitForContent('Total amount:', 60);
    await I.click('Confirm payment');
  }
}

module.exports = CreateClaimOCMC;
