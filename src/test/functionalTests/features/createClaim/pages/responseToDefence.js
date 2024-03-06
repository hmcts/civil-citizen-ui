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
  },
};

class ResponseToDefence {

  async open(caseReference) {
    I.amOnPage(`/case/${caseReference}/claimant-response/task-list`);
  }

  async verifyDashboard() {
    I.waitForText('Submit',60, 'h2');
    I.see('Your response', 'h1');
    I.see('Application incomplete','h2');
    I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    I.see('How they responded', 'h2');
    I.see('Choose what to do next', 'h2');
  }

  async verifyDefendantsResponseFullAdmitPayBySetDate() {
    I.waitForText('Sir John Doe admits they owe all the money you’ve claimed.',60);
    I.see('The defendant’s response','h1');
    I.see('This is the total amount you’ll be paid,');
    I.see('including the claim fee and interest if applicable.');
    I.see('They’ve offered to pay you this by');
    I.see('Why they can’t pay the full amount now?');
    I.see('test');
    I.click(paths.links.see_their_financial_details);
    I.see('Bank and savings accounts');
    I.see('Type of account');
    I.see('Savings account');
    I.see('Balance');
    I.see('£4,000');
    I.see('Joint account');
    I.see('No');
    I.see('Where are they living?');
    I.see('Private rental');
    I.see('Children');
    I.click(paths.buttons.continue);
  }

  async verifyDefendantsResponseForPartAdmit(claimReference) {
    I.waitForText('Why they can’t pay the full amount now?',60,'h2');
    I.see('The defendant’s response','h1');
    I.see('Mrs Jane Doe admits they owe you £500.');
    I.see('They don’t believe they owe the full amount claimed.');
    I.see('They’ve offered to pay you £500 by');
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
    I.see('They’ve offered to pay you £500 by');
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
    I.waitForText('Test reason',60);
    I.see('How they want to pay?', 'h1');
    I.see('They’ve offered to pay you £500 by');
    I.see('This is the total amount you’ll be paid, including the claim fee and interest if applicable.');
    I.see('Why they can’t pay the full amount now?');
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

    I.waitForText('The claim will continue for the total amount you claimed: £1,520',60);
    I.see('Do you want to settle the claim for the £500 the defendant admitted?', 'h1');
    I.see('This is the total amount you\'ll be paid, including the claim fee and interest if applicable');
    I.see('Yes');
    I.see('You can agree to their repayment plan or suggest your own');
    I.see('No');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  verifyAboutTheRepaymentPlan() {
    I.waitForText('No - I\'ll suggest my own',60);
    I.see('How they want to pay?', 'h1');
    I.see('Mrs Jane Doe has offered to pay you in full by');
    I.see('Do you accept the repayment plan?');
    I.see('Yes');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  verifyRepaymentPlanForFullAdmitPayBySetDate() {
    I.waitForText('No - I\'ll suggest my own',60);
    I.see('How they want to pay?', 'h1');
    I.see('Sir John Doe has offered to pay you in full by');
    I.see('Do you accept the repayment plan?');
    I.see('Yes');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  verifyHowToFormaliseARepayment(formaliseType) {
    I.waitForText('which may make it more difficult for them to borrow money to repay you.', 60);
    I.see('Choose how to formalise repayment', 'h1');
    I.see('Sign a settlement agreement');
    I.see('This is a legal agreement between you and the defendant agreeing to the repayment plan.');
    I.see('If they break it you can request a County Court Judgment(CCJ).');
    I.see('We\'ll show you a suggested format for the agreement.');
    I.see('Request a CCJ');
    I.see('You can ask the court to make a formal order binding the defendant to the repayment plan.');
    I.see('This adds the defendant to the CCJ register,');
    if(formaliseType  ===  'CCJ'){
      I.click(paths.options.ccj);
    }else{
      I.click(paths.options.sign_a_settlements_agreement);
    }
    I.click(paths.buttons.save_and_continue);
  }

  verifySignTheSettlementAgreement() {
    I.waitForText('I confirm I’ve read and accept the terms of the agreement.', 60);
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
    I.uncheckOption(paths.options.confirm_and_sign);
    I.checkOption(paths.options.confirm_and_sign);
    I.click(paths.buttons.save_and_continue);
  }

  verifyCCJ() {
    I.waitForText('Has the defendant paid some of the amount owed?', 60);
    I.see('Yes');
    I.see('No');
    I.click(paths.options.yes);
    I.fillField(paths.textBoxes.amountAlreadyPaidCCJ, '100');
    I.click(paths.buttons.save_and_continue);
    I.waitForText('The judgment will order the defendant to pay');
    I.see('Judgment amount', 'h1');
    I.see('including your claim fee and any interest, as shown in this table:');
    I.see('Amount');
    I.see('Claim amount');
    I.see('Claim fee amount');
    I.see('Subtotal');
    I.see('Minus amount already paid');
    I.see('Total');
    I.click(paths.buttons.continue);
  }

  verifyCheckYourAnswersForPartAdmitSettlementAgreement() {
    I.waitForText('Sign a settlement agreement',60);
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Do you accept or reject the defendant\'s admission?');
    I.see('I accept this amount');
    I.see('Do you accept the defendant repayment plan?');
    I.see('I accept this repayment plan');
    I.see('How do you wish to proceed?','h2');
    I.see('How do you want to formalise the repayment plan');
    I.click(paths.buttons.submit_response);
  }

  verifyCheckYourAnswersForFullAdmitCCJ() {
    I.waitForText('Issue a County Court Judgment (CCJ)',60);
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Do you accept the defendant repayment plan?');
    I.see('I accept this repayment plan');
    I.see('How do you wish to proceed?','h2');
    I.see('How do you want to formalise the repayment plan');
    I.click(paths.buttons.submit_response);
  }

  verifyConfirmationScreenForPartAdmitSettlementAgreement(claimNumber) {
    I.waitForText('You\'ve signed a settlement agreement', 60,'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
  }

  verifyConfirmationScreenForFullAdmitCCJ(claimNumber) {
    I.waitForText('County Court Judgment requested', 60,'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
    I.see('What happens next');
    I.see('You\'ve requested a County Court Judgment against the defendant.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
    I.see('Email');
    I.see('Telephone');
  }

  verifyCheckYourAnswersRejectAllNoToProceed() {
    I.waitForText('Do you want to proceed with the claim?',60);
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.click(paths.buttons.submit_response);
  }

  verifyCheckYourAnswersRejectAllYesToProceed() {
    I.waitForText('Do you want to proceed with the claim?',60);
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Hearing requirements', 'h2');
    I.see('Have you tried to settle this claim before going to court?');
    I.see('Do you want an extra 4 weeks to try to settle the claim?');
    I.see('Are there any documents the claimant has that you want the court to consider?');
    I.see('What languages will the documents be provided in?');
    I.click(paths.buttons.submit_response);
  }

  async verifyDefendantsResponseForRejection() {
    I.waitForText('Full response',60,'h3');
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
    I.seeElement(paths.links.full_response_pdf_link);
    I.click(paths.links.full_response_pdf_link);
    I.click(paths.buttons.continue);
  }

  async verifyDefendantsResponseForRejectAllDisputeAll() {
    I.waitForText('Full response',60,'h3');
    I.see('The defendant’s response','h1');
    I.see('Sir John Doe has rejected the claim.');
    I.see('Their defence','h3');
    I.see('Why they disagree with the claim?','h3');
    I.seeElement(paths.links.full_response_pdf_link);
    I.click(paths.links.full_response_pdf_link);
    I.click(paths.buttons.continue);
  }

  async inputProceedWithTheClaim() {
    I.waitForText('Do you want to proceed with claim?',60, 'h1');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async inputNoToProceedWithTheClaim() {
    I.waitForText('Do you want to proceed with claim?',60, 'h1');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyFreeMediation() {
    I.waitForText('If mediation fails and a court hearing is needed, what happened during the mediation appointment cannot be mentioned in court.', 60);
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
    I.click(paths.links.do_not_agree_to_free_mediation);
  }

  async verifyChoseNoFreeMediation() {
    I.waitForText('If you choose not to try mediation this cannot be changed once your response is submitted.', 60);
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
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyChoseNoFreeMediationReasons() {
    I.waitForText(  'Your answers have no impact on the progress or outcome of your case, or on any contact you have with HM Courts and Tribunals Service.', 60);
    I.see('I do not agree to free mediation','h1');
    I.see('You have chosen not to try free mediation. Please tell us why:');
    I.see('I have already tried to resolve the dispute with the other party, with no success');
    I.see('I am not sure what would happen in mediation');
    I.see('I do not think mediation would solve the dispute');
    I.see('I do not want to delay getting a hearing');
    I.see('I want a judge to make a decision on the dispute');
    I.see('Another reason (please specify)');
    I.see('Any information you provide is used solely by HM Courts and Tribunals Service to help us improve our services. ');
    I.click(paths.links.skip_this_section);
  }

  async verifyDeterminationWithoutHearingQuestions() {
    I.waitForText('and giving a note of reason for that decision?', 60);
    I.see('Determination without Hearing Questions', 'h1');
    I.see('Do you consider that this claim is suitable for determination without a hearing,');
    I.see('i.e. by a judge reading and considering the case papers,');
    I.see('witness statements and other documents filled by the parties, making a decision,');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyUsingAnExpertQuestion() {
    I.waitForText('An expert is not a legal representative.', 60);
    I.see('Using an expert', 'h1');
    I.see('It\'s rare for a judge to allow you to use an expert in a small claim.');
    I.see('Most small claims don\'t need an expert.');
    I.click(paths.buttons.continue_without_an_expert);
  }

  async verifyDoYouWantToGiveEvidenceYourself() {
    I.waitForText('Do you want to give evidence yourself?', 60,'h1');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouHaveOtherWitness() {
    I.waitForText('Do you have other witnesses?', 60,'h1');
    I.see('This is someone who can confirm your version of events.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyAnyDatesInTheNext12Months(){
    I.waitForText('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', 60,'h1');
    I.see('These should only be the dates of important events like medical appointments, other court hearing, or holidays you have already booked');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouWantToAskForATelephone(){
    I.waitForText('Do you want to ask for a telephone or video hearing?', 60,'h1');
    I.see('The judge will decide if the hearing can be held by telephone or video.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyAreYourExpertsVulnerable(){
    I.waitForText('The court will look at what adjustments or support the person needs.',60);
    I.see('Are you, your experts or witnesses vulnerable in a way that the court needs to consider?', 'h1');
    I.see('This is someone who has been the victim of domestic or other abuse,');
    I.see('has a learning disability, physical or mental illness or reduced mental capacity.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyDoYouOrExpertsNeedToAttendHearing(){
    I.waitForText('Do you, your experts or witnesses need support to attend a hearing?', 60,'h1');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyHearingAtSpecificCourt(){
    I.waitForText('The court will consider both parties\' circumstances when deciding where to hold the hearing.',60);
    I.see('Do you want to ask for the hearing to be held at a specific court?', 'h1');
    I.see('You can ask for the hearing to be held at a specific court,');
    I.see('for example, if you spend weekdays a long distance from your home.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyWelshLanguage(){
    I.waitForText('Welsh and English',60);
    I.see('Welsh language', 'h1');
    I.see('Welsh is an official language of Wales.');
    I.see('You can use Welsh in court hearings.');
    I.see('Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.see('What languages will the documents be provided in?');
    I.see('English');
    I.see('Welsh');
    I.click(paths.options.english_language);
    I.click(paths.options.document_language);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyTriedToSettle(){
    I.waitForText('consider another form of dispute resolution, such as mediation');
    I.see('Have you tried to settle this claim before going to court?', 'h1');
    I.see('Both parties must take certain steps before going to court. These steps are:');
    I.see('discuss the claim and negotiate with each other');
    I.see('try to reach an agreement about the claim');
    I.see('consider another form of dispute resolution, such as mediation');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyRequestExtra4Weeks(){
    I.waitForText('This will not change the response deadline');
    I.see('Do you want an extra 4 weeks to try to settle the claim?', 'h1');
    I.see('You can use this time to try to settle the claim without going to a hearing.');
    I.see('Settling without going to a hearing may avoid costs including fees.');
    I.see('even if an extra 4 weeks to settle the claim is agreed, you will still need to respond to the claim by the stated deadline.');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyConsiderClaimantDocuments(){
    I.waitForText('Are there any documents the other party has that you want the court to consider?');
    I.click(paths.options.yes);
    I.fillField(paths.textBoxes.details, 'test');
    I.click(paths.buttons.save_and_continue);
  }

  async verifyExpertEvidence(){
    I.waitForText('An expert is not a legal representative.');
    I.see('Do you want to use expert evidence?', 'h1');
    I.see('Expert evidence is an opinion based on the expertise of a specialist, for example - a building surveyor who can comment on the quality of building work.');
    I.see('It will only be allowed if the court cannot make a decision without the expert.');
    I.see('Experts usually only give written evidence. They may appear at a hearing if the experts disagree, and the court can only decide between their evidence by hearing it in person.');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifySentExpertReports(){
    I.waitForText('Have you already sent expert reports to other parties?');
    I.click(paths.options.no);
    I.click(paths.buttons.save_and_continue);
  }

  async verifySharedExpert(){
    I.waitForText('They will prepare a report for the court on behalf of two or more of the parties, including the other party.');
    I.see('Do you want to share an expert with the other party?', 'h1');
    I.see('If you share an expert, you will also share the costs unless the judge decides that one party must pay the other party’s share.');
    I.see('This is known as a ’single joint expert’');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyEnterExpertDetails(){
    I.waitForText('Estimated cost (optional)');
    I.see('Enter the expert’s details', 'h1');
    I.fillField(paths.textBoxes.item0FirstName, 'TestFirstName');
    I.fillField(paths.textBoxes.item0LastName, 'TestLastName');
    I.fillField(paths.textBoxes.item0Email, 'test@test.com');
    I.fillField(paths.textBoxes.item0Phone, '09898989898');
    I.fillField(paths.textBoxes.item0FieldOfExpertise, 'test');
    I.fillField(paths.textBoxes.item0WhyNeedExpert, 'testest');
    I.fillField(paths.textBoxes.item0EstimatedCost, '100');
    I.click(paths.buttons.save_and_continue);
  }

  async verifyGiveEvidenceYourself(){
    I.waitForText('Do you want to give evidence yourself?');
    I.click(paths.options.yes);
    I.click(paths.buttons.save_and_continue);
  }

  async verifyOtherWitnesses(){
    I.waitForText('This is someone who can confirm your version of events.');
    I.see('Do you have other witnesses?', 'h1');
    I.click(paths.options.yes);
    I.waitForText('Tell us what they witnessed');
    I.fillField(paths.textBoxes.item0WitnessFirstName, 'WitnessFName');
    I.fillField(paths.textBoxes.item0WitnessLastName, 'WitnessLName');
    I.fillField(paths.textBoxes.item0WitnessEmail, 'test@test.com');
    I.fillField(paths.textBoxes.item0WitnessDetails, 'testtest');
    I.click(paths.buttons.save_and_continue);
  }

  async verifyCheckYourAnswersForMediationHearingExpertsAndLanguage() {
    I.waitForText('What languages will the documents be provided in?',60);
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
    I.see('Do you believe you, or a witness who will give evidence on your behalf, are vulnerable in anyway which the Court needs to consider?');
    I.see('Do you, your experts or witnesses need support to attend a hearing?');
    I.see('Do you want to ask for the hearing to be held at a specific court?');
    I.see('Welsh language');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.see('English');
    I.click(paths.buttons.submit_response);
  }

  verifyConfirmationScreenForRejection(claimNumber) {
    I.waitForText('You\'ve rejected their response', 60, 'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
  }

  verifyConfirmationScreenForRejectAllNoToProceed(claimNumber) {
    I.waitForText('You didn\'t proceed with the claim', 60,'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
    I.see('What happens next');
    I.see('The claim has now ended. We\'ve emailed Sir John Doe to tell them.');
    I.see('Email');
    I.see('Telephone');
  }

  verifyConfirmationScreenForRejectAllYesToProceed(claimNumber) {
    I.waitForText('You\'ve rejected their response', 60,'h1');
    I.see('Your claim number:');
    I.see(`${claimNumber}`);
    I.see('What happens next');
    I.see('We\'ll review the case. We\'ll contact you to tell you what to do next.');
    I.see('Email');
    I.see('Telephone');
  }

  async verifyAcceptOrRejectRepaymentPlan(){
    I.waitForText('Welsh and English',60);
    I.see('Welsh language', 'h1');
    I.see('Welsh is an official language of Wales.');
    I.see('You can use Welsh in court hearings.');
    I.see('Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.see('What languages will the documents be provided in?');
    I.see('English');
    I.see('Welsh');
    I.click(paths.options.english_language);
    I.click(paths.options.document_language);
    I.click(paths.buttons.save_and_continue);
  }
}

module.exports = ResponseToDefence;
