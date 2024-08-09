const I = actor();
const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const {resetScenarios} = require('../../../functionalTests/specClaimHelpers/api/wiremock');

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
  },
  options: {
    english_language : '#speakLanguage',
    document_language : '#documentsLanguage',
    directionsQuestionnaireSigned: '#directionsQuestionnaireSigned',
    ssaSigned: '#signed',
  },
};

class ClaimantResponseSteps {
  viewDefendantResponse(caseId, includesRepaymentPlan) {
    I.amOnPage(`/case/${caseId}/claimant-response/task-list`);
    I.click(paths.links.view_defendants_response);
    I.waitForContent('The defendant’s response');
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response`);
    clickButton(buttonType.CONTINUE);
    if (includesRepaymentPlan) {
      I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response?page=how-they-want-to-pay-response`);
      I.waitForContent('How they want to pay?');
      clickButton(buttonType.CONTINUE);
    }
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
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

  proposeAlternativePaymentPlan(caseId) {
    I.click(paths.links.propose_alternative_plan);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/payment-option`);
    I.click('Immediately');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/counter-offer-accepted`);
    clickButton(buttonType.CONTINUE);
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
    I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  requestCCJ(caseId) {
    I.click(paths.links.request_a_CCJ);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/county-court-judgement/paid-amount`);
    I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/county-court-judgement/paid-amount-summary`);
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  signSettlementAgreement(caseId) {
    I.click(paths.links.sign_a_settlements_agreement);
    I.seeInCurrentUrl(`/case/${caseId}/claimant-response/sign-settlement-agreement`);
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
    I.click('No');
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

  async resetWiremockScenario() {
    await resetScenarios();
  }
}

module.exports = new ClaimantResponseSteps();
