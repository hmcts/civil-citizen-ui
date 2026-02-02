const I = actor();
const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {resetScenarios} = require('../../../functionalTests/specClaimHelpers/api/wiremock');
const {date} = require('../../../functionalTests/specClaimHelpers/api/dataHelper');

const paths = {
  links: {
    view_defendants_response: '//a[.="View the defendant\'s response"]',
    accept_or_reject: '//a[.=\'Accept or reject the £1000.00\']',
    accept_or_reject_their_response: '//a[.=\'Accept or reject their response\']',
    accept_or_reject_the_payment_plan: '//a[contains(.,\'Accept or reject their repayment plan\')]',
    accept_or_reject_the_plan: '//a[contains(.,\'Accept or reject\')]',
    how_to_formalise_repayment: '//a[.=\'Choose how to formalise repayment\']',
    sign_a_settlements_agreement: '//a[.=\'Sign a settlement agreement\']',
    request_a_CCJ: '//a[.=\'Request a County Court Judgment\']',
    check_and_submit_your_response : '//a[.=\'Check and submit your response\']',
    decide_whether_to_proceed : '//a[.=\'Decide whether to proceed\']',
    free_mediation: '//a[.=\'Free telephone mediation\']',
    details_in_case_of_a_hearing : '//a[.="Give us details in case there\'s a hearing"]',
    have_you_been_paid: '//a[contains(text(), \'Have you been paid the\')]',
    settle_the_claim_for: '//a[contains(text(), \'Settle the claim for\')]',
    propose_alternative_plan: '//a[contains(text(), \'Propose an alternative repayment plan\')]',
    see_their_financial_details: '//span[contains(.,\'See their financial details\')]',
  },
  fields: {
    paymentAmount: 'input[id="paymentAmount"]',
    amount: 'input[id="amount"]',
    rePaymentFrequency: 'input[id="repaymentFrequency-3"]',
    day: 'input[id="day"]',
    month: 'input[id="month"]',
    year: 'input[id="year"]',
    signerName: 'input[id="signerName"]',
    signerTitle: 'input[id="signerRole"]',
  },
  options: {
    english_language : '#speakLanguage',
    document_language : '#documentsLanguage',
    directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
    ssaSigned: '#signed',
  },
};

const dateNow = date(35).split('-'); //format is yyyy-mm-dd
const day = dateNow[2];
const month = dateNow[1];
const year = dateNow[0];

class ClaimantResponseSteps {
  viewDefendantResponse(caseId, includesRepaymentPlan) {
    I.amOnPage(`/case/${caseId}/claimant-response/task-list`);
    I.click(paths.links.view_defendants_response);
    I.waitForContent('The defendant’s response');
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response`);
    clickButton(buttonType.CONTINUE);
    if (includesRepaymentPlan) {
      I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response?page=how-they-want-to-pay-response`);
      I.waitForContent('How they want to pay £60?');
      clickButton(buttonType.CONTINUE);
    }
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async dismissCookieBannerIfVisible() {
    try {
      await I.waitForVisible('#cookie-banner-accept-button', 3);
      I.click('#cookie-banner-accept-button');
      I.wait(1);
      // After accepting, the "You've accepted..." message appears with "Hide this message" – click it to fully dismiss
      try {
        await I.waitForVisible('#cookie-banner-hide-button', 2);
        I.click('#cookie-banner-hide-button');
        I.wait(1);
      } catch (hideErr) {
        // Hide button not visible, continue
      }
    } catch (e) {
      // Cookie banner not visible, continue
    }
  }

  async viewDefendantResponseFullAdmit(caseId, repaymentOption) {
    I.amOnPage(`/case/${caseId}/claimant-response/task-list`);
    I.click(paths.links.view_defendants_response);
    await this.dismissCookieBannerIfVisible();
    this.verifyDefendantsResponseFullAdmitPayByRepaymentPlan(repaymentOption);
    I.waitForContent('The defendant’s response');
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response`);
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  judgementByAdmission(caseId) {
    this.hasDefendantPaid('JudgmentByAdmissions', caseId);
    this.judgmentAmount(caseId);
    this.paymentOptions(caseId);
    this.checkYourAnswers(caseId);
  }

  hasDefendantPaid(judgmentByAdmissions, claimRef){
    if(judgmentByAdmissions === 'JudgmentByAdmissions')
    {
      I.amOnPage('/case/' + claimRef + '/ccj/paid-amount');
    }
    I.waitForContent('Has the defendant paid some of the amount owed?', 60);
    I.click('Yes');
    I.waitForContent('Amount already paid', 60);
    I.fillField(paths.fields.amount, '100');
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  judgmentAmount(caseId){
    I.seeInCurrentUrl(`/case/${caseId}/ccj/paid-amount-summary`);
    I.waitForContent('Judgment amount', 60);
    I.see('The judgment will order the defendant to pay');
    I.see('including your claim fee and any interest, as shown in this table:');
    I.see('Amount');
    I.see('Claim amount');
    I.see('Claim fee amount');
    I.see('Subtotal');
    I.see('Minus amount already paid');
    I.see('Total');
    clickButton(buttonType.CONTINUE);
  }

  paymentOptions(caseId){
    I.seeInCurrentUrl(`/case/${caseId}/ccj/payment-options`);
    I.waitForContent('Payment Options', 60);
    I.see('I would like the defendant to pay:');
    I.click('Immediately');
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  checkYourAnswers(caseId){
    I.seeInCurrentUrl(`/case/${caseId}/ccj/check-and-send`);
    I.waitForContent('Check your answers', 60);
    I.see('Their details (defendant)');
    I.see('Full name');
    I.see('Address');
    I.see('Email');
    I.see('Payment');
    I.see('Has the defendant paid you some of the amount owed?');
    I.see('Amount already paid');
    I.see('Total to be paid by defendant');
    I.see('How you want the defendant to pay?');
    I.see('Statement of truth');
    I.see('The information on this page forms your response.');
    I.see('You can see it on the response form after you submit.');
    I.see('When you\'re satisfied that your answers are accurate, you should tick to "sign" this statement of truth on the form.');
    I.see('I declare that the details I have given are true to the best of my knowledge.');
    I.fillField(paths.fields.signerName, 'name');
    I.fillField(paths.fields.signerTitle, 'title');
    I.click(paths.options.ssaSigned);
    clickButton(buttonType.SIGN_AND_SUBMIT);
  }

  acceptOrRejectPartAdmitPaid(caseId, option) {
    I.click(paths.links.have_you_been_paid);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/part-payment-received`);
    I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  acceptOrRejectRepaymentPlan(caseId, option) {
    I.click(paths.links.accept_or_reject_the_payment_plan);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/accept-payment-method`);
    if (option) {
      I.click('Yes');
    } else {
      I.click('No - I\'ll suggest my own');
    }
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  acceptOrRejectFullAdmitInstalmentsRepaymentPlan(caseId, option) {
    I.click(paths.links.accept_or_reject_the_payment_plan);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/accept-payment-method`);
    this.verifyRepaymentPlanForFullAdmitPayByInstalments();
    if (option) {
      I.click('Yes');
    } else {
      I.click('No - I\'ll suggest my own');
    }
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  proposeAlternativePaymentPlan(caseId) {
    I.click(paths.links.propose_alternative_plan);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/payment-option`);
    I.click('Immediately');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/counter-offer-accepted`);
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  proposeAlternativePaymentPlanInstallments(caseId) {
    I.click(paths.links.propose_alternative_plan);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/payment-option`);
    I.click('By instalments');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/payment-plan`);
    I.fillField(paths.fields.paymentAmount,'250');
    I.click(paths.fields.rePaymentFrequency);
    I.fillField(paths.fields.day, day.toString());
    I.fillField(paths.fields.month, month.toString());
    I.fillField(paths.fields.year, year.toString());
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/counter-offer-accepted`);
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  acceptOrRejectFullAdmitPayImmediately(caseId) {
    I.click(paths.links.accept_or_reject_the_payment_plan);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/accept-payment-method`);
    I.click('Yes');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  acceptOrRejectPartAdmitPayImmediately(caseId, option) {
    I.click(paths.links.accept_or_reject);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/settle-admitted`);
    I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  formaliseRepayment(caseId, option) {
    I.click(paths.links.how_to_formalise_repayment);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/choose-how-to-proceed`);
    this.verifyHowToFormaliseARepayment();
    I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  requestCCJ(caseId, fullAdmit) {
    I.click(paths.links.request_a_CCJ);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/county-court-judgement/paid-amount`);
    I.waitForContent('Has the defendant paid some of the amount owed?', 60);
    I.see('Yes');
    I.see('No');
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/county-court-judgement/paid-amount-summary`);
    I.waitForContent('The judgment will order the defendant to pay');
    I.see('Judgment amount', 'h1');
    if(fullAdmit) {
      I.see('including your claim fee and any interest, as shown in this table:');
    } else {
      I.see('plus claim fee, as shown in this table:');
    }

    I.see('Amount');
    I.see('Claim amount');
    I.see('Claim fee amount');
    I.see('Total');
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  signSettlementAgreement(caseId, option) {
    I.click(paths.links.sign_a_settlements_agreement);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/sign-settlement-agreement`);
    if (option) {
      this.verifySignTheSettlementAgreementForFullAdmit(option);

    }
    I.waitForElement(paths.options.ssaSigned);
    I.checkOption(paths.options.ssaSigned);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  settleTheClaim(caseId, option) {
    I.click(paths.links.settle_the_claim_for);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/settle-claim`);
    I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    if (option === 'No') {
      I.seeInCurrentUrl(`/case/${caseId}/claimant-response/rejection-reason`);
      I.fillField('//*[@id="text"]', 'reasons');
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }

    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  freeTelephoneMediation(caseId) {
    I.click(paths.links.free_mediation);
    I.seeInCurrentUrl(`/case/${caseId}/mediation/free-telephone-mediation`);
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/mediation/can-we-use`);
    I.click('Yes');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  fillDQ(caseId, fastTrackDQ) {
    I.click(paths.links.details_in_case_of_a_hearing);
    if (!fastTrackDQ) {
      I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/determination-without-hearing`);
      I.click('Yes');
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }

    if (fastTrackDQ) {
      I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/tried-to-settle`);
      I.click('Yes');
      clickButton(buttonType.SAVE_AND_CONTINUE);

      I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/request-extra-4-weeks`);
      I.click('No');
      clickButton(buttonType.SAVE_AND_CONTINUE);

      I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/consider-claimant-documents`);
      I.click('No');
      clickButton(buttonType.SAVE_AND_CONTINUE);

      I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/expert-evidence`);
      I.click('No');
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }

    if (!fastTrackDQ) {
      I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/expert`);
      I.click('Continue without an expert');
    }

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/give-evidence-yourself`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/other-witnesses`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/cant-attend-hearing-in-next-12-months`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/phone-or-video-hearing`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/vulnerability`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/support-required`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/court-location`);
    I.see('Please select your preferred court hearing location.', 'h1.govuk-heading-l');
    I.see('You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing. Find your nearest court by postcode :', 'p.govuk-body');
    I.see('Select a court', 'label.govuk-label');

    I.selectOption('select[name="courtLocation"]', 'Barnet Civil and Family Centre - St Mary\'s Court, Regents Park Road - N3 1BQ');
    I.see('Tell us why you want the hearing to be held at this court', 'label.govuk-label');

    I.fillField('textarea[name="reason"]', 'test');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/welsh-language`);
    I.click(paths.options.english_language);
    I.click(paths.options.document_language);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  checkAndSubmit(caseId) {
    I.click(paths.links.check_and_submit_your_response);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/check-and-send`);
    clickButton(buttonType.SUBMIT_RESPONSE);
  }

  checkAndSubmitSigned(caseId) {
    I.click(paths.links.check_and_submit_your_response);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/check-and-send`);
    I.waitForElement(paths.options.directionsQuestionnaireSigned);
    I.checkOption(paths.options.directionsQuestionnaireSigned);
    clickButton(buttonType.SUBMIT_RESPONSE);
  }

  partAdmitSettleClaimConfirmation() {
    I.see('You\'ve accepted their response');
    I.see('The claim is now settled. We\'ve emailed Sir John Doe to tell them.');
    I.see('Go to your account');
  }

  partAdmitClaimantDoesNotSettleConfirmation() {
    I.see('You\'ve rejected their response');
    I.see('What happens next');
    I.see('We\'ll review the case. We\'ll contact you to tell you what to do next.');
    I.see('Go to your account');
  }

  partAdmitClaimantRejectsAndAgreesToMediationConfirmation() {
    I.see('You\'ve rejected their response');
    I.see('What happens next');
    I.see('You agreed to try free mediation.');
    I.see('Your mediation appointment will be arranged within 28 days.');
  }

  partAdmitClaimantRequestsCCJConfirmation() {
    I.see('You\'ve accepted their response');
    I.see('What happens next');
    I.see('You\'ve requested a County Court Judgment against the defendant.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
  }

  partAdmitClaimantSignsSettlementAgreementConfirmation() {
    I.see('You\'ve signed a settlement agreement');
    I.see('What happens next');
    I.see('We\'ve emailed Sir John Doe your proposed repayment plan and settlement agreement for them to sign.');
    I.see('They must respond before 4pm on 13 August 2024. We\'ll email you when they respond.');
    I.see('If they sign the agreement, this claim is put on hold.');
    I.see('If they don\'t sign the agreement or reject it, you can request a CCJ against them which orders them to pay in line with the terms of the repayment plan.');
    I.see('If they don\'t think they can afford the plan, they can ask for a judge to make a different plan.');
  }

  partAdmitClaimantProposesRepaymentPlanConfirmation() {
    I.see('You\'ve proposed a different repayment plan');
    I.see('What happens next');
    I.see('You\'ve requested a County Court Judgment against Sir John Doe.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
    I.see('A judge will decide what Sir John Doe can afford to pay, based on their financial details.');
    I.see('We\'ll contact both you and Sir John Doe to tell you what to do next.');
  }

  fullAdmitJudgementByAdmissionPayImmediatelyConfirmation() {
    I.waitForContent('County Court Judgment requested', 60);
    I.see('We’ll process your request and send a copy of the judgment to you and to Sir John Doe.');
    I.see('We aim to process this request as soon as possible.');
    I.see('Please do not call the Court & Tribunal Service Centre (CTSC) about the progress of your request.');
    I.see('Your online account will not be updated with the progress of this claim and any further updates will be by post.');
    I.see('If a postal response is received before the judgment is issued your request will be rejected.');
    I.see('Email');
    I.see('Telephone');
  }

  fullAdmitPayImmediately() {
    I.see('County Court Judgment requested');
    I.see('What happens next');
    I.see('You\'ve requested a County Court Judgment against the defendant.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
  }

  fullAdmitClaimantRequestsCCJConfirmation() {
    I.see('County Court Judgment requested');
    I.see('What happens next');
    I.see('You\'ve requested a County Court Judgment against the defendant.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
  }

  fullAdmitClaimantSignsSettlementAgreementConfirmationExtra() {
    I.see('If you don\'t get paid');
    I.see('If Sir John Doe signs the settlement agreement but breaks the terms, you can request a County Court Judgment (CCJ) by signing in to your account.');
    I.see('After you\'ve requested a CCJ you can ask the court to enforce payment.');
  }

  fullAdmitClaimantRejectsRepaymentPlan() {
    I.see('County Court Judgment requested');
    I.see('What happens next');
    I.see('You\'ve rejected the defendant\'s repayment plan and a County Court Judgment has been requested against them.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
  }

  fullAdmitClaimantRejectsInstallmentsRepaymentPlan() {
    I.see('You\'ve proposed a different repayment plan');
    I.see('What happens next');
    I.see('You\'ve requested a County Court Judgment against Sir John Doe.');
    I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe');
    I.see('A judge will decide what Sir John Doe can afford to pay, based on their financial details.');
    I.see('We\'ll contact both you and Sir John Doe to tell you what to do next.');
  }

  verifyDefendantsResponseFullAdmitPayByRepaymentPlan(option) {
    I.waitForContent('Sir John Doe admits they owe all the money you’ve claimed.',60);
    I.see('The defendant’s response','h1');
    if(option === 'bySetDate'){
      I.waitForContent('This is the total amount you\'ll be paid', 15);
      I.waitForContent('including the claim fee and interest if applicable.', 10);
      I.waitForContent('They\'ve offered to pay you this by', 10);
      I.click(paths.links.see_their_financial_details);
      I.see('Bank and savings accounts');
      I.see('Type of account');
      I.see('Balance');
      I.see('£100,000');
      I.see('Joint account');
      I.see('No');
      I.see('Where are they living?');
      I.see('Children');
    } else{
      I.waitForContent('They\'ve offered to pay you this in instalments.', 15);
      I.waitForContent('How they want to pay?', 10);
      I.waitForContent('The defendant suggested this repayment plan:', 10);
      I.see('Regular payments of');
      I.see('Frequency of payments');
      I.see('First payment date');
      I.see('Final payment date');
      I.see('Length of repayment plan');
      I.click(paths.links.see_their_financial_details);
      I.see('Bank and savings accounts');
      I.see('Do they have a job?');
      I.see('Do they receive any income?');
      I.see('Has a court ordered them to pay anyone else?');
    }
    I.see('Why they can’t pay the full amount now?');
  }

  verifyRepaymentPlanForFullAdmitPayByInstalments() {
    I.waitForContent('No - I\'ll suggest my own',60);
    I.see('How they want to pay?', 'h1');
    I.see('Regular payments of');
    I.see('Frequency of payments');
    I.see('First payment date');
    I.see('Final payment date');
    I.see('Length of repayment plan');
    I.see('Do you accept the repayment plan?');
  }

  verifyHowToFormaliseARepayment() {
    I.waitForContent('which may make it more difficult for them to borrow money to repay you.', 60);
    I.see('Choose how to formalise repayment', 'h1');
    I.see('Sign a settlement agreement');
    I.see('This is a legal agreement between you and the defendant agreeing to the repayment plan.');
    I.see('If they break it you can request a County Court Judgment(CCJ).');
    I.see('We\'ll show you a suggested format for the agreement.');
    I.see('Request a CCJ');
    I.see('You can ask the court to make a formal order binding the defendant to the repayment plan.');
    I.see('This adds the defendant to the CCJ register,');
  }

  verifySignTheSettlementAgreementForFullAdmit(option) {
    I.waitForContent('I confirm I’ve read and accept the terms of the agreement.', 60);
    I.see('Terms of the agreement', 'h1');
    I.see('The agreement');
    if (option === 'bySetDate') {
      I.see('Sir John Doe will pay £1500, no later than');
    } else {
      I.see('Sir John Doe will repay £1500 in instalments');
      I.see('The first instalment will be paid by');
    }
    I.see('Completion date');
    I.see('This agreement settles the claim made by Miss Jane Doe against Sir John Doe.');
    I.see('This includes all money owed in the claim, for example court fees, expenses or interest.');
    I.see('Neither party can make any further claims relating to this case, other than to enforce it.');
    I.see('Either party can view and download this agreement from their Money Claims account.');
    I.see('Both parties should keep a copy of this agreement.');
    I.see('If the agreement is broken', 'h2');
    I.see('The claimant can request a County Court Judgment (CCJ) for any money still owed from this agreement.');
    I.see('Sign the agreement', 'h2');
    I.see('Make sure this agreement includes everything you’ve agreed with Sir John Doe before signing.');
    I.see('You won’t be able to change this later.');
  }

  verifyCheckYourAnswersForFullAdmitCCJ(caseId) {
    I.click(paths.links.check_and_submit_your_response);
    I.waitForContent('Issue a County Court Judgment (CCJ)',60);
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Do you accept the defendant repayment plan?');
    I.see('I accept this repayment plan');
    I.see('How do you wish to proceed?','h2');
    I.see('How do you want to formalise the repayment plan');
    I.amOnPage(`/case/${caseId}/claimant-response/task-list`);
  }

  verifyCheckYourAnswersForFullAdmitSettlementAgreement(caseId) {
    I.click(paths.links.check_and_submit_your_response);
    I.waitForContent('Sign a settlement agreement',60);
    I.see('Check your answers', 'h1');
    I.see('Your response','h2');
    I.see('Do you accept the defendant repayment plan?');
    I.see('I accept this repayment plan');
    I.see('How do you wish to proceed?','h2');
    I.see('How do you want to formalise the repayment plan');
    I.amOnPage(`/case/${caseId}/claimant-response/task-list`);
  }

  async resetWiremockScenario() {
    await resetScenarios();
  }
}

module.exports = new ClaimantResponseSteps();
