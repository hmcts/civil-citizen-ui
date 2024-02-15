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
    confirm_and_sign : '#signed',
    yes: '#option',
    no: '//input[@value=\'no\']',
    english_language : '#speakLanguage',
    document_language : '#documentsLanguage',
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

  async verifyHowTheyWantToPay(claimReference) {
    I.see('How they want to pay?', 'h1');
    I.see('They’ve offered to pay you £500 by 14 February 2025.');
    I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    I.see('Why they can’t pay the full amount now?');
    I.see('Test reason');
    I.click(paths.links.see_their_financial_details);
    I.see('Where are they living?');
    I.see('Home you own yourself (or pay a mortgage on)');
    I.see('Balance');
    I.see('£2,000');
    I.see('Claim number');
    I.see(`${claimReference}`);
    I.see('Student loan');
    I.see('£8,000');
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

  async verifyDefendantsResponseForRejection() {
    I.see('The defendant’s response','h1');
    I.see('Mrs Jane Doe has rejected the claim.');
    I.see('Their defence','h3');
    I.see('Why they disagree with the claim?','h3');
    I.see('Test reason');
    I.see('Their evidence','h3');
    I.see('Type');
    I.see('Description');
    I.see('Contracts and agreements');
    I.see('TestEvidence');
    I.see('Full response','h3');
    I.seeElement(paths.links.full_response_pdf_link);
    I.click(paths.links.full_response_pdf_link);
    I.click(paths.buttons.continue);
  }

  async inputProceedWithTheClaim() {
    I.see('Do you want to proceed with claim?','h1');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyFreeMediation() {
    I.see('Free telephone mediation','h1');
    I.see('We have automatically registered you for free telephone mediation from HM Courts and Tribunals Service.');
    I.see('How free mediation works','h2');
    I.see('A trained, neutral mediator from HM Courts and Tribunals Service will listen to your views and help you to negotiate a settlement of your dispute.');
    I.see('Mediation can be quicker, cheaper and less stressful than going to court.');
    I.see('Mediation is confidential, and nothing said in the mediation can be used in court proceedings if the dispute cannot be settled.');
    I.see('The mediator speaks to each party separately, this is not a conference call.');
    I.see('The claimant must agree to mediation.');
    I.see('We\'ll contact you within 28 days after the claimant\'s confirmation, to arrange a free appointment.');
    I.see('Your mediation appointment will last for no more than an hour.');
    I.see('Find out more about');
    I.seeElement('//a[contains(.,\'free telephone mediation (opens in new tab).\')]');
    I.see('Reaching a settlement','h2');
    I.see('If mediation is successful, you\'ll make a verbal agreement over the phone.');
    I.see('This is legally binding which means that you must comply with it.');
    I.see('You will be given the terms of the agreement in a document – this is called a settlement agreement.');
    I.see('If either party breaks the terms the other party can go to court to ask for a judgment or hearing.');
    I.see('You will not have to wait longer for a court hearing if you choose mediation.');
    I.see('If mediation fails and a court hearing is needed, what happened during the mediation appointment cannot be mentioned in court.');
    I.click(paths.links.do_not_agree_to_free_mediation);
  }

  async verifyChoseNoFreeMediation() {
    I.see('You chose not to try free mediation','h1');
    I.see('The claim will continue and you may have to go to a hearing.');
    I.see('Advantages of free mediation','h2');
    I.see('There are many advantages to free mediation, including:');
    I.see('mediation can be quicker and cheaper than going to court');
    I.see('the mediator speaks to each side separately, you do not speak to the other party during mediation');
    I.see('it gives you control over how your dispute is settled, which is not possible by going to court');
    I.see('it\'s confidential and nothing said or done during mediation can be used in court');
    I.see('mediation can avoid a');
    I.seeElement('//a[contains(.,\'County Court Judgment (opens in a new tab)\')]');
    I.see('being made against you');
    I.see('Will you change your decision and try free mediation?','h2');
    I.see('If you choose not to try mediation this cannot be changed once your response is submitted.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyChoseNoFreeMediationReasons() {
    I.see('I do not agree to free mediation','h1');
    I.see('You have chosen not to try free mediation. Please tell us why:');
    I.see('I have already tried to resolve the dispute with the other party, with no success');
    I.see('I am not sure what would happen in mediation');
    I.see('I do not think mediation would solve the dispute');
    I.see('I do not want to delay getting a hearing');
    I.see('I want a judge to make a decision on the dispute');
    I.see('Another reason (please specify)');
    I.see('Any information you provide is used solely by HM Courts and Tribunals Service to help us improve our services. ');
    I.see(  'Your answers have no impact on the progress or outcome of your case, or on any contact you have with HM Courts and Tribunals Service.');
    I.click(paths.links.skip_this_section);
  }

  async verifyDeterminationWithoutHearingQuestions() {
    I.see('Determination without Hearing Questions', 'h1');
    I.see('Do you consider that this claim is suitable for determination without a hearing,');
    I.see('i.e. by a judge reading and considering the case papers,');
    I.see('witness statements and other documents filled by the parties, making a decision,');
    I.see('and giving a note of reason for that decision?');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyUsingAnExpertQuestion() {
    I.see('Using an expert', 'h1');
    I.see('It\'s rare for a judge to allow you to use an expert in a small claim.');
    I.see('Most small claims don\'t need an expert.');
    I.see('An expert is not a legal representative.');
    I.click(paths.buttons.continue_without_an_expert);
  }

  async verifyDoYouWantToGiveEvidenceYourself() {
    I.see('Do you want to give evidence yourself?', 'h1');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouHaveOtherWitness() {
    I.see('Do you have other witnesses?', 'h1');
    I.see('This is someone who can confirm your version of events.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyAnyDatesInTheNext12Months(){
    I.see('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', 'h1');
    I.see('These should only be the dates of important events like medical appointments, other court hearing, or holidays you have already booked');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouWantToAskForATelephone(){
    I.see('Do you want to ask for a telephone or video hearing?', 'h1');
    I.see('The judge will decide if the hearing can be held by telephone or video.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyAreYourExpertsVulnerable(){
    I.see('Are you, your experts or witnesses vulnerable in a way that the court needs to consider?', 'h1');
    I.see('This is someone who has been the victim of domestic or other abuse,');
    I.see('has a learning disability, physical or mental illness or reduced mental capacity.');
    I.see('The court will look at what adjustments or support the person needs.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouOrExpertsNeedToAttendHearing(){
    I.see('Do you, your experts or witnesses need support to attend a hearing?', 'h1');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyHearingAtSpecificCourt(){
    I.see('Do you want to ask for the hearing to be held at a specific court?', 'h1');
    I.see('You can ask for the hearing to be held at a specific court,');
    I.see('for example, if you spend weekdays a long distance from your home.');
    I.see('The court will consider both parties\' circumstances when deciding where to hold the hearing.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyWelshLanguage(){
    I.see('Welsh language', 'h1');
    I.see('Welsh is an official language of Wales.');
    I.see('You can use Welsh in court hearings.');
    I.see('Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.see('What languages will the documents be provided in?');
    I.see('English');
    I.see('Welsh');
    I.see('Welsh and English');
    I.click(paths.options.english_language);
    I.click(paths.options.document_language);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyCheckYourAnswersForMediationHearingExpertsAndLanguage() {
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Do you want to proceed with the claim?');
    I.see('Yes');
    I.see('Free telephone mediation','h2');
    I.see('Will you try free mediation?');
    I.see('No');
    I.see('Do you consider that this claim is suitable for determination without a hearing,i.e. by a judge reading and considering the case papers, witness statements and other documents filled by the parties, making a decision, and giving a note of reason for that decision?\tNo');
    I.see('Have you already got a report written by an expert?');
    I.see('Do you want to ask for the court’s permission to use an expert?');
    I.see('Does the claim involve something an expert can still examine?');
    I.see('Do you want to give evidence yourself?');
    I.see('Do you have other witnesses?');
    I.see('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?');
    I.see('Do you want to ask for a telephone or video hearing?');
    I.see('Do you believe you, or a witness who will give evidence on your behalf, are vulnerable in anyway which the Court needs to consider?')
    I.see('Do you, your experts or witnesses need support to attend a hearing?');
    I.see('Do you want to ask for the hearing to be held at a specific court?');
    I.see('Welsh language');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.see('English');
    I.see('What languages will the documents be provided in?');
    I.click(paths.buttons.submit_response);
  }

  verifyConfirmationScreenForRejection(claimNumber) {
    I.see('You\'ve rejected their response', 'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
  }
}

module.exports = ReponseToDefence;
