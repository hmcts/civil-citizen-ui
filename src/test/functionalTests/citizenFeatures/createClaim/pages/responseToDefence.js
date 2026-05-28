const I = actor();
/*const config = require('../../../../config');*/

const paths = {
  links: {
    see_their_financial_details: '//span[contains(.,\'See their financial details\')]',
    privacy_policy: '//a[.=\'privacy policy\']',
    full_response_pdf_link :'//a[.=\'Download their full response (PDF)\']',
    do_not_agree_to_free_mediation : '//a[contains(.,\'I do not agree to free mediation\')]',
    skip_this_section : '//a[contains(.,\'Skip this section\')]',
  },
  buttons: {
    continue: 'Continue',
    save_and_continue: 'Save and continue',
    continue_without_an_expert : 'Continue without an expert',
    submit_response: 'Submit Response',
  },
  options: {
    sign_a_settlements_agreement: '#option',
    ccj: '#option-2',
    confirm_and_sign : '#signed',
    yes: '#option',
    no: '//input[@value=\'no\']',
    english_language : '#speakLanguage',
    document_language : '#documentsLanguage',
    paymentOptionImmediate: 'input[id="paymentType"]',
    acceptCourtDecision: 'input[id="decision"]',
  },
  textBoxes: {
    amountAlreadyPaidCCJ: '#amount',
    details: '#details',
    item0FirstName: 'input[id="items[0][firstName]"]',
    item0LastName: 'input[id="items[0][lastName]"]',
    item0Email: 'input[id="items[0][emailAddress]"]',
    item0Phone: 'input[id="items[0][phoneNumber]"]',
    item0FieldOfExpertise: 'input[id="items[0][fieldOfExpertise]"]',
    item0WhyNeedExpert: 'textarea[id="items[0][whyNeedExpert]"]',
    item0EstimatedCost: 'input[id="items[0][estimatedCost]"]',
    item0WitnessFirstName: 'input[id="witnessItems[0][firstName]"]',
    item0WitnessLastName: 'input[id="witnessItems[0][lastName]"]',
    item0WitnessEmail: 'input[id="witnessItems[0][email]"]',
    item0WitnessPhone: 'input[id="witnessItems[0][telephone]"]',
    item0WitnessDetails: 'textarea[id="witnessItems[0][details]"]',
    rejectReason: 'textarea[id="text"]',
  },
};

const d = new Date();
const dd = String(d.getDate()).padStart(2, '0');
const mm = String(d.getMonth() + 1).padStart(2, '0');
const yyyy = String(d.getFullYear());

class ResponseToDefence {

  async open(caseReference) {
    await I.amOnPage(`/case/${caseReference}/claimant-response/task-list`);
  }

  async verifyDashboard() {
    await I.waitForContent('Submit', 60);
    await I.see('Your response', 'h1');
    await I.see('Application incomplete','h2');
    await I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    await I.see('How they responded', 'h2');
  }

  async verifyDefendantsResponseFullAdmitPayByRepaymentPlan(option) {
    await I.waitForContent('Sir John Doe admits they owe all the money you’ve claimed.',60);
    await I.see('The defendant’s response','h1');
    if(option === 'bySetDate'){
      await I.see('This is the total amount you’ll be paid,');
      await I.see('including the claim fee and interest if applicable.');
      await I.see('They’ve offered to pay you this by');
      await I.click(paths.links.see_their_financial_details);
      await I.see('Bank and savings accounts');
      await I.see('Type of account');
      await I.see('Savings account');
      await I.see('Balance');
      await I.see('£4,000');
      await I.see('Joint account');
      await I.see('No');
      await I.see('Where are they living?');
      await I.see('Private rental');
      await I.see('Children');
    } else{
      await I.see('They\'ve offered to pay you this in instalments.');
      await I.see('How they want to pay?');
      await I.see('The defendant suggested this repayment plan:');
      await I.see('Regular payments of');
      await I.see('Frequency of payments');
      await I.see('First payment date');
      await I.see('Final payment date');
      await I.see('Length of repayment plan');
      await I.click(paths.links.see_their_financial_details);
      await I.see('Bank and savings accounts');
      await I.see('Do they have a job?');
      await I.see('Do they receive any income?');
      await I.see('Has a court ordered them to pay anyone else?');
    }
    await I.see('Why they can’t pay the full amount now?');
    await I.see('test');
    await I.click(paths.buttons.continue);
  }

  async verifyDefResponseForPartAdmitInstallmentPayment(claimAmount) {
    await I.waitForContent('Why they don’t owe the amount claimed?', 60);
    await I.see('The defendant suggested this repayment plan:');
    await I.see(`They’ve offered to pay you £${claimAmount} plus the claim fee in instalments. This is the total amount you’ll be paid.`);
    await I.click(paths.buttons.continue);
  }

  async verifyDefResponseForPartAdmitPayBySetDate(claimAmount) {
    await I.waitForContent('Why they don’t owe the amount claimed?', 60);
    await I.see(`Sir John Doe admits they owe you £${claimAmount}. They don’t believe they owe the full amount claimed.`);
    await I.see(`They’ve offered to pay you £${claimAmount} by`);
    await I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    await I.click(paths.buttons.continue);
  }

  async verifyDefResponseForPartAdmitImmediatePayment(claimAmount) {
    await I.waitForContent('Why they don’t owe the amount claimed?', 60);
    await I.see('Contracts and agreements');
    await I.see(`Sir John Doe admits they owe you £${claimAmount}`);
    await I.see(`They’ve offered to pay you £${claimAmount} plus the claim fee immediately. This is the total amount you’ll be paid.`);
    await I.click(paths.buttons.continue);
  }

  async acceptOrRejectTheAmountDefendantAdmittedAndSettle(claimAmount, acceptOrReject) {
    await I.waitForContent(`Do you want to settle the claim for the £${claimAmount} the defendant admitted?`);
    await I.see('You can agree to their repayment plan or suggest your own');
    if (acceptOrReject == 'accept') {
      await I.click(paths.options.yes);
    } else {
      await I.click(paths.options.no);
    }
    await I.click(paths.buttons.save_and_continue);
  }

  async acceptOrRejectTheAmountCYA(acceptOrReject) {
    await I.waitForClickable(paths.buttons.submit_response);
    await I.waitForContent('Do you accept or reject the defendant\'s admission?');
    if (acceptOrReject == 'accept') {
      await I.see('I accept this amount');
    } else {
      await I.see('I reject this amount');
      await I.checkOption('#directionsQuestionnaireSigned');
    }
    await I.click(paths.buttons.submit_response);
  }

  async acceptOrRejectTheirRepaymentPlan(acceptOrReject) {
    await I.waitForClickable(paths.buttons.save_and_continue);
    await I.waitForContent('How they want to pay?');
    if (acceptOrReject == 'accept') {
      await I.see('Yes');
      await I.click(paths.options.yes);
    } else {
      await I.see('No - I\'ll suggest my own');
      await I.click(paths.options.no);
    }
    await I.click(paths.buttons.save_and_continue);
  }

  async proposePaymentPlan() {
    await I.see('How do you want the defendant to pay?');
    await I.checkOption('#paymentType'); //Immediately radio
    await I.click(paths.buttons.save_and_continue);
    await I.see('t afford your plan');
    await I.checkOption('#decision-2'); //Judge make repayment plan
    await I.click(paths.buttons.save_and_continue);
    await I.see('Why did you reject the repayment plan?');
    await I.fillField(paths.textBoxes.rejectReason, 'testReason');
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyAcceptOrRejectConfirmationScreen(acceptOrReject = 'accept', admittedAmount = '200.00') {
    await I.waitForContent('What happens next');
    if (acceptOrReject == 'accept') {
      await I.see('You\'ve accepted their response');
      await I.see(`The defendant said they'll pay you £${admittedAmount} plus the claim fee immediately.`);
      await I.see('They must make sure you have the money by');
      await I.see('Any cheques or transfers should be clear in your account.');
      await I.see('You need to tell us if you\'ve settled the claim, for example because the defendant has paid you.');
      await I.see('Go to your account');
    } else {
      await I.see('You\'ve rejected their response');
    }
  }

  async verifyDefendantsResponseForPartAdmit(claimReference) {
    await I.waitForContent('Why they can’t pay the full amount now?', 60);
    await I.see('The defendant’s response','h1');
    await I.see('Mrs Jane Doe admits they owe you £500.');
    await I.see('They don’t believe they owe the full amount claimed.');
    await I.see('They’ve offered to pay you £500 by');
    await I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    await I.see('Their defence','h2');
    await I.see('Why they don’t owe the amount claimed?');
    await I.see('Test reason');
    await I.see('Their timeline of events');
    await I.see('Date');
    await I.see('What happened');
    await I.see('TestTimeLine');
    await I.see('Type');
    await I.see('Description');
    await I.see('Contracts and agreements');
    await I.see('TestEvidence');
    await I.see('How they want to pay?');
    await I.see('They’ve offered to pay you £500 by');
    await I.see('This is the total amount you\'ll be paid, including the claim fee and interest if applicable.');
    await I.see('Why they can’t pay the full amount now?','h2');
    await I.click(paths.links.see_their_financial_details);
    await I.see('Bank and savings accounts');
    await I.see('Type of account');
    await I.see('Current account');
    await I.see('Balance');
    await I.see('£2,000');
    await I.see('Joint account');
    await I.see('No');
    await I.see('Where are they living?');
    await I.see('Home you own yourself (or pay a mortgage on)');
    await I.see('Children');
    await I.see('Do any children live with them?');
    await I.see('Yes');
    await I.see('How many are aged under 11?');
    await I.see('1');
    await I.see('How many are aged 16 to 19?');
    await I.see('0');
    await I.see('Financial support');
    await I.see('Number of people');
    await I.see('2');
    await I.see('Give details');
    await I.see('Parents');
    await I.see('Employment details');
    await I.see('Employed');
    await I.see('Self-employed');
    await I.see('Self-employed');
    await I.see('ABC Ltd');
    await I.see('Builder');
    await I.see('Claim number');
    await I.see(`${claimReference}`);
    await I.see('Amount they owe');
    await I.see('£1,000');
    await I.see('Debts');
    await I.see('Debt');
    await I.see('Mortgage');
    await I.see('Monthly Payments');
    await I.see('£120');
    await I.see('Gas');
    await I.see('£10');
    await I.see('Council Tax or Community Charge');
    await I.see('£20');
    await I.see('Electricity');
    await I.see('£5');
    await I.see('HSBC Credit card');
    await I.see('Total owed');
    await I.see('£1,200');
    await I.see('Motor vehicle loan');
    await I.see('£14,000');
    await I.see('£220');
    await I.see('Student loan');
    await I.see('£8,000');
    await I.see('£400');
    await I.click(paths.buttons.continue);
  }

  async verifyHowTheyWantToPay(claimReference) {
    await I.waitForContent('Test reason', 60);
    await I.see('How they want to pay?', 'h1');
    await I.see('They’ve offered to pay you £500 by');
    await I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    await I.see('Why they can’t pay the full amount now?');
    await I.click(paths.links.see_their_financial_details);
    await I.see('Where are they living?');
    await I.see('Home you own yourself (or pay a mortgage on)');
    await I.see('Balance');
    await I.see('£2,000');
    await I.see('Claim number');
    await I.see(`${claimReference}`);
    await I.see('Student loan');
    await I.see('£8,000');
    await I.click(paths.buttons.continue);
  }

  async verifyHowTheyWantToPayPayBySetDate() {
    await I.waitForContent('Why they can’t pay the full amount now?', 60);
    await I.see('How they want to pay?', 'h1');
    await I.see('They’ve offered to pay you');
    await I.see('by');
    await I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    await I.click(paths.links.see_their_financial_details);
    await I.see('Where are they living?');
    await I.see('Balance');
    await I.click(paths.buttons.continue);
  }

  async verifyDoYouWantToSettleTheClaim() {

    await I.waitForContent('The claim will continue for the total amount you claimed: £1,520',60);
    await I.see('Do you want to settle the claim for the £500 the defendant admitted?', 'h1');
    await I.see('This is the total amount you\'ll be paid, including the claim fee and interest if applicable');
    await I.see('Yes');
    await I.see('You can agree to their repayment plan or suggest your own');
    await I.see('No');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyAboutTheRepaymentPlan() {
    await I.waitForContent('No - I\'ll suggest my own', 60);
    await I.see('How they want to pay?', 'h1');
    await I.see('Mrs Jane Doe has offered to pay you by');
    await I.see('Do you accept the repayment plan?');
    await I.see('Yes');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyRepaymentPlanForFullAdmitPayBySetDate() {
    await I.waitForContent('No - I\'ll suggest my own',60);
    await I.see('How they want to pay?', 'h1');
    await I.see('Sir John Doe has offered to pay you by');
    await I.see('Do you accept the repayment plan?');
    await I.see('Yes');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async ConfirmThatYouHaveBeenPaid() {
    await I.waitForText('Confirm that you\'ve been paid',60);
    await I.see('Enter the date that you were paid the full amount that was specified on the judgment');
    await I.waitForElement('#day', 10);
    await I.fillField('#day', dd);
    await I.fillField('#month', mm);
    await I.fillField('#year', yyyy);
    await I.click('#confirmed');
    await I.click('Submit');
    await I.waitForText('You\'ve confirmed that you\'ve been paid', 60);
    await I.click('Close and return to case details');
  }
  async CertificateOfSatisfactionAndCancellation() {
    await I.waitForText('Confirm you\'ve paid a judgment (CCJ) debt',60);
    await I.click('Confirm you\'ve paid a judgment (CCJ) debt');
    await I.click('Continue');
    await I.waitForText('When was the final payment?', 60);
    await I.waitForElement('#day', 10);
    await I.fillField('#day', dd);
    await I.fillField('#month', mm);
    await I.fillField('#year', yyyy);
    await I.click('Continue');
    await I.waitForText('Do you have evidence of the debt payment?', 60);
    await I.click('#debtPaymentOption-4');
    await I.waitForElement('#provideDetails', 10);
    await I.fillField('#provideDetails', 'Testing');
    await I.click('Continue');
    await I.waitForText('Check your answers', 60);
    await I.click('#signed');
    await I.fillField('#name', 'Testing');
    await I.click('Submit');
    await I.waitForText('Pay the fee', 60);
  }
  async verifyRepaymentPlanForPartAdmitPayBySetDate(acceptOrReject) {
    await I.waitForContent('No - I\'ll suggest my own',60);
    await I.see('How they want to pay?', 'h1');
    await I.see('Sir John Doe has offered to pay you by');
    await I.see('Do you accept the repayment plan?');
    await I.see('Yes');
    if (acceptOrReject == 'accept') {
      await I.click(paths.options.yes);
    } else {
      await I.click(paths.options.no);
    }
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyRepaymentPlanForFullAdmitPayByInstalments() {
    await I.waitForContent('No - I\'ll suggest my own',60);
    await I.see('How they want to pay?', 'h1');
    await I.see('Regular payments of');
    await I.see('Frequency of payments');
    await I.see('First payment date');
    await I.see('Final payment date');
    await I.see('Length of repayment plan');
    await I.see('Do you accept the repayment plan?');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyProposeAnAlternativePaymentPlan() {
    await I.waitForContent('By instalments',60);
    await I.see('How do you want the defendant to pay?', 'h1');
    await I.see('Immediately');
    await I.see('By a set date');
    await I.click(paths.options.paymentOptionImmediate);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyCourtRejectedProposedPlan() {
    await I.waitForContent('The defendant can’t afford your plan',60);
    await I.see('Based on the financial details provided by the defendant');
    await I.see('we don’t believe they would be able to make these repayments.');
    await I.see('The court affordability calculator has determined a new repayment plan as the most the defendant can repay.');
    await I.see('The court’s proposed repayment plan');
    await I.see('Do you accept the court’s proposed repayment plan?');
    await I.see('I want to accept this repayment plan');
    await I.see('I want a judge to make a repayment plan');
    await I.click(paths.options.acceptCourtDecision);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyCourtAcceptedProposedPlan() {
    await I.waitForContent('The court has accepted your repayment plan', 60);
    await I.see('Repayment plan accepted', 'h1');
    await I.click(paths.buttons.continue);
  }

  async verifySignTheSettlementAgreementForFullAdmit(option) {
    await I.waitForContent('I confirm I’ve read and accept the terms of the agreement.', 60);
    await I.see('Terms of the agreement', 'h1');
    await I.see('The agreement');
    if(option === 'bySetDate'){
      await I.see('Sir John Doe will pay £1500, no later than');
    }else {
      await I.see('Sir John Doe will repay £1500 in instalments');
      await I.see('The first instalment will be paid by');
    }
    await I.see('Completion date');
    await I.see('This agreement settles the claim made by Miss Jane Doe against Sir John Doe.');
    await I.see('This includes all money owed in the claim, for example court fees, expenses or interest.');
    await I.see('Neither party can make any further claims relating to this case, other than to enforce it.');
    await I.see('Either party can view and download this agreement from their Money Claims account.');
    await I.see('Both parties should keep a copy of this agreement.');
    await I.see('If the agreement is broken','h2');
    await I.see('The claimant can request a County Court Judgment (CCJ) for any money still owed from this agreement.');
    await I.see('Sign the agreement','h2');
    await I.see('Make sure this agreement includes everything you’ve agreed with Sir John Doe before signing.');
    await I.see('You won’t be able to change this later.');
    await I.uncheckOption(paths.options.confirm_and_sign);
    await I.checkOption(paths.options.confirm_and_sign);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyHowToFormaliseARepayment(formaliseType) {
    await I.waitForContent('which may make it more difficult for them to borrow money to repay you.', 60);
    await I.see('Choose how to formalise repayment', 'h1');
    await I.see('Sign a settlement agreement');
    await I.see('This is a legal agreement between you and the defendant agreeing to the repayment plan.');
    await I.see('If they break it you can request a County Court Judgment(CCJ).');
    await I.see('We\'ll show you a suggested format for the agreement.');
    await I.see('Request a CCJ');
    await I.see('You can ask the court to make a formal order binding the defendant to the repayment plan.');
    await I.see('This adds the defendant to the CCJ register,');
    if(formaliseType  ===  'CCJ'){
      await I.click(paths.options.ccj);
    }else{
      await I.click(paths.options.sign_a_settlements_agreement);
    }
    await I.click(paths.buttons.save_and_continue);
  }

  async verifySignTheSettlementAgreement() {
    await I.waitForContent('I confirm I’ve read and accept the terms of the agreement.', 60);
    await I.see('Terms of the agreement', 'h1');
    await I.see('The agreement');
    await I.see('Mrs Jane Doe will pay £500, no later than');
    await I.see('Completion date');

    await I.see('This agreement settles the claim made by Mr Joe Bloggs against Mrs Jane Doe.');
    await I.see('This includes all money owed in the claim, for example court fees, expenses or interest.');
    await I.see('Neither party can make any further claims relating to this case, other than to enforce it.');
    await I.see('Either party can view and download this agreement from their Money Claims account.');
    await I.see('Both parties should keep a copy of this agreement.');
    await I.see('If the agreement is broken','h2');
    await I.see('The claimant can request a County Court Judgment (CCJ) for any money still owed from this agreement.');
    await I.see('Sign the agreement','h2');
    await I.see('Make sure this agreement includes everything you’ve agreed with Mrs Jane Doe before signing.');
    await I.see('You won’t be able to change this later.');
    await I.see('I confirm I’ve read and accept the terms of the agreement.');
    await I.uncheckOption(paths.options.confirm_and_sign);
    await I.checkOption(paths.options.confirm_and_sign);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifySignTheSettlementAgreementForPartAdmit() {
    await I.waitForContent('I confirm I’ve read and accept the terms of the agreement.', 60);
    await I.see('Terms of the agreement', 'h1');
    await I.see('The agreement');
    await I.see('Sir John Doe will pay ');
    await I.see(', no later than');
    await I.see('Completion date');
    await I.see('This agreement settles the claim made by Miss Jane Doe against Sir John Doe.');
    await I.see('This includes all money owed in the claim, for example court fees, expenses or interest.');
    await I.see('Neither party can make any further claims relating to this case, other than to enforce it.');
    await I.see('Either party can view and download this agreement from their Money Claims account.');
    await I.see('Both parties should keep a copy of this agreement.');
    await I.see('If the agreement is broken','h2');
    await I.see('The claimant can request a County Court Judgment (CCJ) for any money still owed from this agreement.');
    await I.see('Sign the agreement','h2');
    await I.see('Make sure this agreement includes everything you’ve agreed with Sir John Doe before signing.');
    await I.see('You won’t be able to change this later.');
    await I.uncheckOption(paths.options.confirm_and_sign);
    await I.checkOption(paths.options.confirm_and_sign);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyCCJ() {
    await I.waitForContent('Has the defendant paid some of the amount owed?', 60);
    await I.see('Yes');
    await I.see('No');
    await I.click(paths.options.no);
    // I.fillField(paths.textBoxes.amountAlreadyPaidCCJ, '100');
    await I.click(paths.buttons.save_and_continue);
    // I.waitForContent('The judgment will order the defendant to pay');
    /*I.see('Judgment amount', 'h1');
    I.see('including your claim fee and any interest, as shown in this table:');
    I.see('Amount');
    I.see('Claim amount');
    I.see('Claim fee amount');
    I.see('Subtotal');
    I.see('Minus amount already paid');
    I.see('Total'); */
    await I.click(paths.buttons.continue);
  }

  async verifyCheckYourAnswersForFullAdmitSettlementAgreement() {
    await I.waitForContent('Sign a settlement agreement',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you accept the defendant repayment plan?');
    await I.see('I accept this repayment plan');
    await I.see('How do you wish to proceed?','h2');
    await I.see('How do you want to formalise the repayment plan');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersForFullAdmitRejectPlanSettlementAgreement() {
    await I.waitForContent('Sign a settlement agreement',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you accept the defendant repayment plan?');
    await I.see('I reject this repayment plan');
    await I.see('How do you wish to proceed?','h2');
    await I.see('How do you want to formalise the repayment plan');
    await I.see('Court Decision');
    await I.see('The court rejected your repayment plan and calculated a more affordable one.');
    await I.see('Court repayment plan');
    await I.see('Sir John Doe will repay £1500 in instalments of £100 every month.');
    await I.see('The first instalment will be paid by');
    await I.see('Completion date');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersForPartAdmitSettlementAgreement() {
    await I.waitForContent('Sign a settlement agreement',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you accept or reject the defendant\'s admission?');
    await I.see('I accept this amount');
    await I.see('Do you accept the defendant repayment plan?');
    await I.see('I accept this repayment plan');
    await I.see('How do you wish to proceed?','h2');
    await I.see('How do you want to formalise the repayment plan');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersForFullAdmitCCJ() {
    await I.waitForContent('Issue a County Court Judgment (CCJ)',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you accept the defendant repayment plan?');
    await I.see('I accept this repayment plan');
    await I.see('How do you wish to proceed?','h2');
    await I.see('How do you want to formalise the repayment plan');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersForPartAdmitCCJ() {
    await I.waitForContent('Issue a County Court Judgment (CCJ)',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you accept the defendant repayment plan?');
    await I.see('I reject this repayment plan');
    await I.see('How you want the defendant to pay?');
    await I.see('Immediately');
    await I.see('Court Decision');
    await I.see('Court repayment plan');
    await I.see('Completion date');
    await I.click(paths.buttons.submit_response);
  }

  async verifyConfirmationScreenForFullAdmitSettlementAgreement(claimNumber) {
    await I.waitForContent('You\'ve signed a settlement agreement', 60,'h1');
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
  }

  async verifyConfirmationScreenForFullAdmitRejectPlanSettlementAgreement(claimNumber){
    await I.waitForContent('You\'ve signed a settlement agreement', 60,'h1');
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('We\'ve emailed Sir John Doe your proposed repayment plan and settlement agreement for them to sign.');
    await I.see('They must respond before 4pm on');
    await I.see('We\'ll email you when they respond.');
    await I.see('If they sign the agreement, this claim is put on hold.');
    await I.see('If they don\'t sign the agreement or reject it');
    await I.see('you can request a CCJ against them which orders them to pay in line with the terms of the repayment plan.');
    await I.see('If they don\'t think they can afford the plan, they can ask for a judge to make a different plan.');
    await I.see('If you don\'t get paid');
    await I.see('If Sir John Doe signs the settlement agreement but breaks the terms');
    await I.see('you can request a County Court Judgment (CCJ) by signing in to your account.');
    await I.see('After you\'ve requested a CCJ you can ask the court to enforce payment.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyConfirmationScreenForPartAdmitSettlementAgreement(claimNumber) {
    await I.waitForContent('You\'ve signed a settlement agreement', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
  }

  async verifyConfirmationScreenForPartAdmitCCJ(claimNumber) {
    await I.waitForContent('County Court Judgment requested', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyConfirmationScreenForFullAdmitCCJ(claimNumber) {
    await I.waitForContent('County Court Judgment requested', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('You\'ve requested a County Court Judgment against the defendant.');
    await I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyCheckYourAnswersRejectAllNoToProceed() {
    await I.waitForContent('Do you want to proceed with the claim?',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersRejectAllSettleClaimInFull() {
    await I.waitForContent('Do you want to settle the claim for the £1500?',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersRejectAllSettleClaimNotInFull() {
    await I.waitForContent('Do you want to settle the claim for the £10000?',60);
    await I.see('Do you agree the defendant has paid £10000?');
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersRejectAllNotToSettleClaimNotInFull(){
    await I.waitForContent('Do you agree the defendant has paid £567?',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you want to settle the claim for the £567?');
    await I.see('Hearing requirements');
    await I.see('Have you already got a report written by an expert?');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersRejectAllNotToSettleClaimInFull() {
    await I.waitForContent('Do you want to settle the claim for the £15000?',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Hearing requirements', 'h2');
    await I.see('Have you tried to settle this claim before going to court?');
    await I.see('Do you want an extra 4 weeks to try to settle the claim?');
    await I.see('Are there any documents the claimant has that you want the court to consider?');
    await I.see('What languages will the documents be provided in?');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersRejectAllYesToProceed() {
    await I.waitForContent('Do you want to proceed with the claim?',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Hearing requirements', 'h2');
    await I.see('Have you tried to settle this claim before going to court?');
    await I.see('Do you want an extra 4 weeks to try to settle the claim?');
    await I.see('Are there any documents the claimant has that you want the court to consider?');
    await I.see('What languages will the documents be provided in?');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersPartAdmitAlreadyPaidSettleClaim() {
    await I.waitForContent('Do you agree the defendant has paid £700?',60);
    await I.see('Do you want to settle the claim for the £700?');
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersPartAdmitAlreadyPaidNotToSettleClaim() {
    await I.waitForContent('Do you agree the defendant has paid',60);
    await I.see('Do you want to settle the claim for the');
    await I.see('Hearing requirements');
    await I.see('Have you tried to settle this claim before going to court?');
    await I.see('Are there any documents the claimant has that you want the court to consider?');
    await I.see('Welsh language');
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.click(paths.buttons.submit_response);
  }

  async verifyCheckYourAnswersPartAdmitAlreadyPaidGoToMediation() {
    await I.waitForContent('Do you agree the defendant has paid',60);
    await I.see('Availability for mediation');
    await I.see('Hearing requirements');
    await I.see('Have you already got a report written by an expert?');
    await I.see('Welsh language');
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.click(paths.buttons.submit_response);
  }

  async verifyDefendantsResponseForRejection() {
    await I.waitForContent('Full response',60);
    await I.see('The defendant’s response');
    await I.see('has rejected the claim.');

    await I.see('Their defence');
    await I.see('Why they disagree with the claim?');
    await I.see('Test reason');
    await I.see('Their evidence');

    await I.see('Type');
    await I.see('Description');
    await I.see('Contracts and agreements');
    await I.see('TestEvidence');
    await I.seeElement(paths.links.full_response_pdf_link);
    await I.click(paths.links.full_response_pdf_link);
    await I.wait(2);
    await I.clickWithRetry(`//button[contains(normalize-space(), '${paths.buttons.continue}')]`);
  }

  async verifyDefendantsResponseForRejectAllDisputeAll() {
    await I.waitForContent('Full response',60);
    await I.see('The defendant’s response');
    await I.see('Sir John Doe has rejected the claim.');
    await I.see('Their defence');
    await I.see('Why they disagree with the claim?');
    await I.seeElement(paths.links.full_response_pdf_link);
    await I.click(paths.links.full_response_pdf_link);
    await I.wait(2);
    await I.clickWithRetry(`//button[contains(normalize-space(), '${paths.buttons.continue}')]`);
  }

  async verifyDefendantsResponseForRejectAllAlreadyPaidInFull() {
    await I.waitForContent('Full response',60);
    await I.see('The defendant’s response');
    await I.see('Sir John Doe said they paid you');
    await I.see('When they say they paid this amount');
    await I.see('How they say they paid?');
    await I.seeElement(paths.links.full_response_pdf_link);
    await I.click(paths.links.full_response_pdf_link);
    await I.wait(2);
    await I.clickWithRetry(`//button[contains(normalize-space(), '${paths.buttons.continue}')]`);
  }

  async verifyDefendantsResponseForRejectAllAlreadyPaidNotInFull() {
    await I.waitForContent('Full response',60);
    await I.see('The defendant’s response');
    await I.see('Sir John Doe said they paid you');
    await I.see('They said this is all they owe, not the amount you claim.');
    await I.see('When they say they paid this amount');
    await I.see('How they say they paid?');
    await I.see('Why they say they dont owe the amount you claimed?');
    await I.seeElement(paths.links.full_response_pdf_link);
    await I.click(paths.links.full_response_pdf_link);
    await I.wait(2);
    await I.clickWithRetry(`//button[contains(normalize-space(), '${paths.buttons.continue}')]`);
  }

  async verifyDefendantsResponseForPartAdmiAlreadyPaid(withTimeLineEvidenceDisagree) {
    await I.waitForContent('Full response', 60);
    await I.see('The defendant’s response');
    await I.see('Sir John Doe said they paid you');
    await I.see('They said this is all they owe, not the amount you claimed.');
    await I.see('When they say they paid this amount');
    await I.see('How they say they paid?');
    await I.see('Why they say they don’t owe the amount you claimed?');
    await I.see('Their timeline of events');
    if (withTimeLineEvidenceDisagree === 'disagree') {
      await I.see('Why they disagree with your timeline?');
      await I.see('Why they disagree with your evidence?');
    }
    await I.see('Their evidence');
    await I.seeElement(paths.links.full_response_pdf_link);
    await I.click(paths.links.full_response_pdf_link);
    await I.wait(2);
    await I.clickWithRetry(`//button[contains(normalize-space(), '${paths.buttons.continue}')]`);
  }

  async inputProceedWithTheClaim() {
    await I.waitForContent('Do you want to proceed with claim?',60);
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async inputNoToProceedWithTheClaim() {
    await I.waitForContent('Do you want to proceed with claim?',60);
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async inputSettleWithTheClaimInFull() {
    await I.waitForContent('Do you agree the defendant has paid the £1500 in full?',60);
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async inputNotoSettleWithTheClaimInFull() {
    await I.waitForContent('Do you agree the defendant has paid the £15000 in full?',60);
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
    await I.waitForContent('Why did you reject their response?', 60);
    await I.fillField(paths.textBoxes.rejectReason, 'testReason');
    await I.click(paths.buttons.save_and_continue);
  }

  async paymentNotInFullYesPaid() {
    await I.waitForContent('Has the defendant paid you', 60);
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async paymentNotInFullNoPaid() {
    await I.waitForContent('Has the defendant paid you', 60);
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async paymentNotInFullNoToSettle() {
    await I.waitForContent('Do you want to settle the claim for the',60);
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
    await I.waitForContent('Why did you reject their response?', 60);
    await I.fillField(paths.textBoxes.rejectReason, 'testReason');
    await I.click(paths.buttons.save_and_continue);
  }

  async paymentNotInFullYesToSettle() {
    await I.waitForContent('Do you want to settle the claim for the',60);
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyFreeMediation() {
    await I.waitForContent('If mediation fails and a court hearing is needed, what happened during the mediation appointment cannot be mentioned in court.', 60);
    await I.see('Free telephone mediation','h1');
    await I.see('We have automatically registered you for free telephone mediation from HM Courts and Tribunals Service.');
    await I.see('How free mediation works','h2');
    await I.see('A trained, neutral mediator from HM Courts and Tribunals Service will listen to your views and help you to negotiate a settlement of your dispute.');
    await I.see('Mediation can be quicker, cheaper and less stressful than going to court.');
    await I.see('Mediation is confidential, and nothing said in the mediation can be used in court proceedings if the dispute cannot be settled.');
    await I.see('The mediator speaks to each party separately, this is not a conference call.');
    await I.see('The claimant must agree to mediation.');
    await I.see('We\'ll contact you within 28 days after the claimant\'s confirmation, to arrange a free appointment.');
    await I.see('Your mediation appointment will last for no more than an hour.');
    await I.see('Find out more about');
    await I.seeElement('//a[contains(.,\'free telephone mediation (opens in new tab).\')]');
    await I.see('Reaching a settlement','h2');
    await I.see('If mediation is successful, you\'ll make a verbal agreement over the phone.');
    await I.see('This is legally binding which means that you must comply with it.');
    await I.see('You will be given the terms of the agreement in a document – this is called a settlement agreement.');
    await I.see('If either party breaks the terms the other party can go to court to ask for a judgment or hearing.');
    await I.see('You will not have to wait longer for a court hearing if you choose mediation.');
  }

  async verifyChoseNoFreeMediation() {
    await I.click(paths.links.do_not_agree_to_free_mediation);
    await I.waitForContent('If you choose not to try mediation this cannot be changed once your response is submitted.', 60);
    await I.see('You chose not to try free mediation','h1');
    await I.see('The claim will continue and you may have to go to a hearing.');
    await I.see('Advantages of free mediation','h2');
    await I.see('There are many advantages to free mediation, including:');
    await I.see('mediation can be quicker and cheaper than going to court');
    await I.see('the mediator speaks to each side separately, you do not speak to the other party during mediation');
    await I.see('it gives you control over how your dispute is settled, which is not possible by going to court');
    await I.see('it\'s confidential and nothing said or done during mediation can be used in court');
    await I.see('mediation can avoid a');
    await I.seeElement('//a[contains(.,\'County Court Judgment (opens in a new tab)\')]');
    await I.see('being made against you');
    await I.see('Will you change your decision and try free mediation?','h2');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyChoseYesFreeMediation() {
    await I.click(paths.buttons.continue);
    await I.waitForContent('Confirm your telephone number', 60);
    await I.see('Can the mediation service use');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyChoseNoFreeMediationReasons() {
    await I.waitForContent(  'Your answers have no impact on the progress or outcome of your case, or on any contact you have with HM Courts and Tribunals Service.', 60);
    await I.see('I do not agree to free mediation','h1');
    await I.see('You have chosen not to try free mediation. Please tell us why:');
    await I.see('I have already tried to resolve the dispute with the other party, with no success');
    await I.see('I am not sure what would happen in mediation');
    await I.see('I do not think mediation would solve the dispute');
    await I.see('I do not want to delay getting a hearing');
    await I.see('I want a judge to make a decision on the dispute');
    await I.see('Another reason (please specify)');
    await I.see('Any information you provide is used solely by HM Courts and Tribunals Service to help us improve our services. ');
    await I.click(paths.links.skip_this_section);
  }

  async verifyDeterminationWithoutHearingQuestions() {
    await I.waitForContent('and giving a note of reason for that decision?', 60);
    await I.see('Determination without Hearing Questions', 'h1');
    await I.see('Do you consider that this claim is suitable for determination without a hearing,');
    await I.see('i.e. by a judge reading and considering the case papers,');
    await I.see('witness statements and other documents filled by the parties, making a decision,');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyUsingAnExpertQuestion() {
    await I.waitForContent('An expert is not a legal representative.', 60);
    await I.see('Using an expert', 'h1');
    await I.see('It\'s rare for a judge to allow you to use an expert in a small claim.');
    await I.see('Most small claims don\'t need an expert.');
    await I.click(paths.buttons.continue_without_an_expert);
  }

  async verifyDoYouWantToGiveEvidenceYourself() {
    await I.waitForContent('Do you want to give evidence yourself?', 60);
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouHaveOtherWitness() {
    await I.waitForContent('Do you have other witnesses?', 60);
    await I.see('This is someone who can confirm your version of events.');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyAnyDatesInTheNext12Months(){
    await I.waitForContent('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', 60);
    await I.see('These should only be the dates of important events like medical appointments, other court hearing, or holidays you have already booked');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouWantToAskForATelephone(){
    await I.waitForContent('Do you want to ask for a telephone or video hearing?', 60);
    await I.see('The judge will decide if the hearing can be held by telephone or video.');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyAreYourExpertsVulnerable(){
    await I.waitForContent('The court will look at what adjustments or support the person needs.',60);
    await I.see('Are you, your experts or witnesses vulnerable in a way that the court needs to consider?', 'h1');
    await I.see('This is someone who has been the victim of domestic or other abuse,');
    await I.see('has a learning disability, physical or mental illness or reduced mental capacity.');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouOrExpertsNeedToAttendHearing(){
    await I.waitForContent('Do you, your experts or witnesses need support to attend a hearing?', 60);
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyHearingAtSpecificCourt(){
    await I.waitForContent('The court will consider both parties\' circumstances when deciding where to hold the hearing.',60);
    await I.see('You can ask for the hearing to be held at a specific court,');
    await I.see('Select a court');
    await I.selectOption('select[name="courtLocation"]', 'Barnsley Law Courts - The Court House, Westgate - S70 2DW');
    await I.see('Tell us why you want the hearing to be held at this court');
    await I.fillField('#reason', 'nearest location');
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyWelshLanguage(){
    await I.waitForContent('Welsh and English',60);
    await I.see('Welsh language', 'h1');
    await I.see('Welsh is an official language of Wales.');
    await I.see('Welsh is an official language of Wales. You can use Welsh in court hearings and at mediation. Asking to speak in Welsh will not delay the hearing or mediation appointment or have any effect on proceedings or the outcome of a case.');
    await I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    await I.see('What languages will the documents be provided in?');
    await I.see('English');
    await I.see('Welsh');
    await I.click(paths.options.english_language);
    await I.click(paths.options.document_language);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyWelshLanguageForFT(){
    await I.waitForContent('Welsh and English',60);
    await I.see('Welsh language', 'h1');
    await I.see('Welsh is an official language of Wales.');
    await I.see('Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    await I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    await I.see('What languages will the documents be provided in?');
    await I.see('English');
    await I.see('Welsh');
    await I.click(paths.options.english_language);
    await I.click(paths.options.document_language);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyTriedToSettle(){
    await I.waitForContent('consider another form of dispute resolution, such as mediation');
    await I.see('Have you tried to settle this claim before going to court?', 'h1');
    await I.see('Both parties must take certain steps before going to court. These steps are:');
    await I.see('discuss the claim and negotiate with each other');
    await I.see('try to reach an agreement about the claim');
    await I.see('consider another form of dispute resolution, such as mediation');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyRequestExtra4Weeks(){
    await I.waitForContent('This will not change the response deadline');
    await I.see('Do you want an extra 4 weeks to try to settle the claim?', 'h1');
    await I.see('You can use this time to try to settle the claim without going to a hearing.');
    await I.see('Settling without going to a hearing may avoid costs including fees.');
    await I.see('Even if an extra 4 weeks to settle the claim is agreed, you will still need to respond to the claim by the stated deadline.');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyConsiderClaimantDocuments(){
    await I.waitForContent('Are there any documents the other party has that you want the court to consider?');
    await I.click(paths.options.yes);
    await I.fillField(paths.textBoxes.details, 'test');
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyExpertEvidence(){
    await I.waitForContent('An expert is not a legal representative.');
    await I.see('Do you want to use expert evidence?', 'h1');
    await I.see('Expert evidence is an opinion based on the expertise of a specialist, for example - a building surveyor who can comment on the quality of building work.');
    await I.see('It will only be allowed if the court cannot make a decision without the expert.');
    await I.see('Experts usually only give written evidence. They may appear at a hearing if the experts disagree, and the court can only decide between their evidence by hearing it in person.');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifySentExpertReports(){
    await I.waitForContent('Have you already sent expert reports to other parties?');
    await I.click(paths.options.no);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifySharedExpert(){
    await I.waitForContent('They will prepare a report for the court on behalf of two or more of the parties, including the other party.');
    await I.see('Do you want to share an expert with the other party?', 'h1');
    await I.see('If you share an expert, you will also share the costs unless the judge decides that one party must pay the other party’s share.');
    await I.see('This is known as a ’single joint expert’');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyEnterExpertDetails(){
    await I.waitForContent('Estimated cost (optional)');
    await I.see('Enter the expert’s details', 'h1');
    await I.fillField(paths.textBoxes.item0FirstName, 'TestFirstName');
    await I.fillField(paths.textBoxes.item0LastName, 'TestLastName');
    await I.fillField(paths.textBoxes.item0Email, 'test@test.com');
    await I.fillField(paths.textBoxes.item0Phone, '09898989898');
    await I.fillField(paths.textBoxes.item0FieldOfExpertise, 'test');
    await I.fillField(paths.textBoxes.item0WhyNeedExpert, 'testest');
    await I.fillField(paths.textBoxes.item0EstimatedCost, '100');
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyGiveEvidenceYourself(){
    await I.waitForContent('Do you want to give evidence yourself?');
    await I.click(paths.options.yes);
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyOtherWitnesses(){
    await I.waitForContent('This is someone who can confirm your version of events.');
    await I.see('Do you have other witnesses?', 'h1');
    await I.click(paths.options.yes);
    await I.waitForContent('Tell us what they witnessed');
    await I.fillField(paths.textBoxes.item0WitnessFirstName, 'WitnessFName');
    await I.fillField(paths.textBoxes.item0WitnessLastName, 'WitnessLName');
    await I.fillField(paths.textBoxes.item0WitnessEmail, 'test@test.com');
    await I.fillField(paths.textBoxes.item0WitnessDetails, 'testtest');
    await I.click(paths.buttons.save_and_continue);
  }

  async verifyCheckYourAnswersForMediationHearingExpertsAndLanguage() {
    await I.waitForContent('What languages will the documents be provided in?',60);
    await I.see('Check your answers', 'h1');
    await I.see('Your response','h2');
    await I.see('Do you want to proceed with the claim?');
    await I.see('Yes');
    await I.see('Free telephone mediation','h2');
    await I.see('Will you try free mediation?');
    await I.see('No');
    await I.see('Do you consider that this claim is suitable for determination without a hearing,i.e. by a judge reading and considering the case papers, witness statements and other documents filled by the parties, making a decision, and giving a note of reason for that decision?\tYes');
    await I.see('Have you already got a report written by an expert?');
    await I.see('Do you want to ask for the court’s permission to use an expert?');
    await I.see('Does the claim involve something an expert can still examine?');
    await I.see('Do you want to give evidence yourself?');
    await I.see('Do you have other witnesses?');
    await I.see('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?');
    await I.see('Do you want to ask for a telephone or video hearing?');
    await I.see('Do you believe you, or a witness who will give evidence on your behalf, are vulnerable in anyway which the Court needs to consider?');
    await I.see('Do you, your experts or witnesses need support to attend a hearing?');
    await I.see('Please select your preferred court hearing location');
    await I.see('Tell us why you want the hearing to be held at this court');
    await I.see('Welsh language');
    await I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    await I.see('English');
    await I.click(paths.buttons.submit_response);
  }

  async verifyConfirmationScreenForRejection(claimNumber) {
    await I.waitForContent('You\'ve rejected their response', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
  }

  async verifyConfirmationScreenForRejectAllNoToProceed(claimNumber) {
    await I.waitForContent('You didn\'t proceed with the claim', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('The claim has now ended. We\'ve emailed Sir John Doe to tell them.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyConfirmationScreenForRejectAllYesToProceed(claimNumber) {
    await I.waitForContent('You\'ve rejected their response', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyConfirmationScreenForRejectAllSettleClaimInFull(claimNumber) {
    await I.waitForContent('You\'ve accepted their response', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('The claim is now settled. We\'ve emailed Sir John Doe to tell them.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyConfirmationScreenForPartAdmitAlreadyPaidSettleClaim(claimNumber) {
    await I.waitForContent('You\'ve accepted their response', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('The claim is now settled. We\'ve emailed Sir John Doe to tell them.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyConfirmationScreenForPartAdmitAlreadyPaidGoToMediation(claimNumber){
    await I.waitForContent('You\'ve rejected their response', 60);
    await I.see('Your claim number:');
    await I.see(`${claimNumber}`);
    await I.see('What happens next');
    await I.see('A mediation appointment will now be arranged by the Small Claims Mediation Service.');
    await I.see('within the next 28 days.');
    await I.see('You can send messages and documents to the court by selecting');
    await I.see('Telephone');
  }

  async verifyAcceptOrRejectRepaymentPlan(){
    await I.waitForContent('Welsh and English',60);
    await I.see('Welsh language', 'h1');
    await I.see('Welsh is an official language of Wales.');
    await I.see('Welsh is an official language of Wales. You can use Welsh in court hearings and at mediation. Asking to speak in Welsh will not delay the hearing or mediation appointment or have any effect on proceedings or the outcome of a case.');
    await I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    await I.see('What languages will the documents be provided in?');
    await I.see('English');
    await I.see('Welsh');
    await I.click(paths.options.english_language);
    await I.click(paths.options.document_language);
    await I.click(paths.buttons.save_and_continue);
  }
}

module.exports = ResponseToDefence;
