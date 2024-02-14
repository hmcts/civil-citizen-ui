const I = actor();
/*const config = require('../../../../config');*/

const paths = {
  links: {
    view_defendants_response: '//a[.="View the defendant\'s response"]',
    see_their_financial_details: '//span[contains(.,\'See their financial details\')]',
    privacy_policy: '//a[.=\'privacy policy\']',
  },
  buttons: {
    i_have_confirmed_i_have_read_this: 'I confirm I\'ve read this',
    continue: 'Continue',
    save_and_continue: 'Save and continue',
    find_address_field: '//input[@name=\'primaryAddressPostcode\']',
    submit_claim: 'Submit claim',
    submit_response: 'Submit Response',
    go_to_your_account: 'Go to your account',
  },
  options: {
    sign_a_settlements_agreement: '#option',
    confirm_and_sign : '#signed',
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

class ReponseToDefence {

  async open(caseReference) {
    I.amOnPage(`/case/${caseReference}/claimant-response/task-list`);
  }

  async verifyDashboard() {
    I.see('Your response', 'h1');
    I.see('Application incomplete','h2');
    I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    I.see('How they responded', 'h2');
    I.see('Choose what to do next', 'h2');
    I.see('Submit','h2');
  }

  async verifyDefendantsResponse(claimReference) {
    I.see('The defendant’s response','h1');
    I.see('Mrs Jane Doe admits they owe you £500.');
    I.see('They don’t believe they owe the full amount claimed.');
    I.see('They’ve offered to pay you £500 by 14 February 2025.');
    I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    I.see('Their defence','h3');
    I.see('Why they don’t owe the amount claimed?');
    I.see('Test reason');
    I.see('Their timeline of events');
    I.see('Date');
    I.see('What happened');
    I.see('TestTimeLine');
    I.see('Type');
    I.see('Description');
    I.see('Contracts and agreements');
    I.see('TestEvidence');
    I.see('How they want to pay?');
    I.see('They’ve offered to pay you £500 by 14 February 2025.');
    I.see('This is the total amount you\'ll be paid, including the claim fee and interest if applicable.');
    I.see('Why they can’t pay the full amount now?','h2');
    I.click(paths.links.see_their_financial_details);
    I.see('Bank and savings accounts');
    I.see('Type of account');
    I.see('Current account');
    I.see('Balance');
    I.see('£2,000');
    I.see('Joint account');
    I.see('No');
    I.see('Where are they living?');
    I.see('Home you own yourself (or pay a mortgage on)');
    I.see('Children');
    I.see('Do any children live with them?');
    I.see('Yes');
    I.see('How many are aged under 11?');
    I.see('1');
    I.see('How many are aged 16 to 19?');
    I.see('0');
    I.see('Financial support');
    I.see('Number of people');
    I.see('2');
    I.see('Give details');
    I.see('Parents');
    I.see('Employment details');
    I.see('Employed');
    I.see('Self-employed');
    I.see('Self-employed');
    I.see('ABC Ltd');
    I.see('Builder');
    I.see('Claim number');
    I.see(`${claimReference}`);
    I.see('Amount they owe');
    I.see('£1,000');
    I.see('Debts');
    I.see('Debt');
    I.see('Mortgage');
    I.see('Monthly Payments');
    I.see('£120');
    I.see('Gas');
    I.see('£10');
    I.see('Council Tax or Community Charge');
    I.see('£20');
    I.see('Electricity');
    I.see('£5');
    I.see('HSBC Credit card');
    I.see('Total owed');
    I.see('£1,200');
    I.see('Motor vehicle loan');
    I.see('£14,000');
    I.see('£220');
    I.see('Student loan');
    I.see('£8,000');
    I.see('£400');
    I.click(paths.buttons.continue);
  }

  async verifyHowTheyWantToPay() {
    I.see('How they want to pay?', 'h1');
    I.see('They’ve offered to pay you £500 by 14 February 2025.');
    I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    I.see('Why they can’t pay the full amount now?');
    I.see('Test reason');
    I.click(paths.buttons.continue);
  }

  async verifyDoYouWantToSettleTheClaim() {

    I.see('Do you want to settle the claim for the £500 the defendant admitted?', 'h1');
    I.see('This is the total amount you\'ll be paid, including the claim fee and interest if applicable');
    I.see('Yes');
    I.see('You can agree to their repayment plan or suggest your own');
    I.see('No');
    I.see('The claim will continue for the total amount you claimed: £1,520');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  verifyAboutTheRepaymentPlan() {
    I.see('How they want to pay?', 'h1');
    I.see('Mrs Jane Doe has offered to pay you in full by');
    I.see('Do you accept the repayment plan?');
    I.see('Yes');
    I.see('No - I\'ll suggest my own');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  verifyHowToFormaliseARepayment() {
    I.see('Choose how to formalise repayment', 'h1');
    I.see('Sign a settlement agreement');
    I.see('This is a legal agreement between you and the defendant agreeing to the repayment plan.');
    I.see('If they break it you can request a County Court Judgment(CCJ).');
    I.see('We\'ll show you a suggested format for the agreement.');
    I.see('Request a CCJ');
    I.see('You can ask the court to make a formal order binding the defendant to the repayment plan.');
    I.see('This adds the defendant to the CCJ register,');
    I.see('which may make it more difficult for them to borrow money to repay you.');
    I.click(paths.options.sign_a_settlements_agreement);
    I.click(paths.buttons.save_and_continue);
  }

  verifySignTheSettlementAgreement() {
    I.see('Terms of the agreement', 'h1');
    I.see('The agreement');
    I.see('Mrs Jane Doe will pay £500, no later than');
    I.see('Completion date');

    I.see('This agreement settles the claim made by Mr Joe Bloggs against Mrs Jane Doe.');
    I.see('This includes all money owed in the claim, for example court fees, expenses or interest.');
    I.see('Neither party can make any further claims relating to this case, other than to enforce it.');
    I.see('Either party can view and download this agreement from their Money Claims account.');
    I.see('Both parties should keep a copy of this agreement.');
    I.see('If the agreement is broken','h2');
    I.see('The claimant can request a County Court Judgment (CCJ) for any money still owed from this agreement.');
    I.see('Sign the agreement','h2');
    I.see('Make sure this agreement includes everything you’ve agreed with Mrs Jane Doe before signing.');
    I.see('You won’t be able to change this later.');
    I.see('I confirm I’ve read and accept the terms of the agreement.');
    I.click(paths.options.confirm_and_sign);
    I.click(paths.buttons.save_and_continue);
  }

  verifyCheckYourAnswers() {
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Do you accept or reject the defendant\'s admission?');
    I.see('I accept this amount');
    I.see('Do you accept the defendant repayment plan?');
    I.see('I accept this repayment plan');
    I.see('How do you wish to proceed?','h2');
    I.see('How do you want to formalise the repayment plan');
    I.see('Sign a settlement agreement');
    I.click(paths.buttons.submit_response);
  }

  verifyConfirmationScreen(claimNumber) {
    I.see('You\'ve signed a settlement agreement', 'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
  }
}

module.exports = ReponseToDefence;
