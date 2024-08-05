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
  async viewDefendantResponse(caseId, includesRepaymentPlan) {
    await I.amOnPage(`/case/${caseId}/claimant-response/task-list`);
    await I.click(paths.links.view_defendants_response);
    await I.waitForContent('The defendant’s response');
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response`);
    clickButton(buttonType.CONTINUE);
    if (includesRepaymentPlan) {
      await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/defendants-response?page=how-they-want-to-pay-response`);
      await I.waitForContent('How they want to pay?');
      clickButton(buttonType.CONTINUE);
    }
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async acceptOrRejectPartAdmitPaid(caseId, option) {
    await I.click(paths.links.have_you_been_paid);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/part-payment-received`);
    await I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async acceptOrRejectRepaymentPlan(caseId, option) {
    await I.click(paths.links.accept_or_reject_the_payment_plan);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/accept-payment-method`);
    if (option) {
      await I.click('Yes');
    } else {
      await I.click('No - I\'ll suggest my own');
    }
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async proposeAlternativePaymentPlan(caseId) {
    await I.click(paths.links.propose_alternative_plan);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/payment-option`);
    await I.click('Immediately');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/counter-offer-accepted`);
    clickButton(buttonType.CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async acceptOrRejectPartAdmitPayImmediately(caseId, option) {
    await I.click(paths.links.accept_or_reject);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/settle-admitted`);
    await I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async formaliseRepayment(caseId, option) {
    await I.click(paths.links.how_to_formalise_repayment);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/choose-how-to-proceed`);
    await I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async requestCCJ(caseId) {
    await I.click(paths.links.request_a_CCJ);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/county-court-judgement/paid-amount`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/county-court-judgement/paid-amount-summary`);
    clickButton(buttonType.CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async signSettlementAgreement(caseId) {
    await I.click(paths.links.sign_a_settlements_agreement);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/sign-settlement-agreement`);
    await I.waitForElement(paths.options.ssaSigned);
    await I.checkOption(paths.options.ssaSigned);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async settleTheClaim(caseId, option) {
    await I.click(paths.links.settle_the_claim_for);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/settle-claim`);
    await I.click(option);
    clickButton(buttonType.SAVE_AND_CONTINUE);

    if (option === 'No') {
      await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/rejection-reason`);
      I.fillField('//*[@id="text"]', 'reasons');
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }

    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async freeTelephoneMediation(caseId) {
    await I.click(paths.links.free_mediation);
    await I.seeInCurrentUrl(`/case/${caseId}/mediation/free-telephone-mediation`);
    clickButton(buttonType.CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/mediation/can-we-use`);
    await I.click('Yes');
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async fillDQ(caseId, fastTrackDQ) {
    await I.click(paths.links.details_in_case_of_a_hearing);
    if (!fastTrackDQ) {
      await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/determination-without-hearing`);
      await I.click('Yes');
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }

    if (fastTrackDQ) {
      await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/tried-to-settle`);
      await I.click('Yes');
      clickButton(buttonType.SAVE_AND_CONTINUE);

      await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/request-extra-4-weeks`);
      await I.click('No');
      clickButton(buttonType.SAVE_AND_CONTINUE);

      await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/consider-claimant-documents`);
      await I.click('No');
      clickButton(buttonType.SAVE_AND_CONTINUE);

      await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/expert-evidence`);
      await I.click('No');
      clickButton(buttonType.SAVE_AND_CONTINUE);
    }

    if (!fastTrackDQ) {
      await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/expert`);
      await I.click('Continue without an expert');
    }

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/give-evidence-yourself`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/other-witnesses`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/cant-attend-hearing-in-next-12-months`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/phone-or-video-hearing`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/vulnerability`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/support-required`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/court-location`);
    await I.click('No');
    clickButton(buttonType.SAVE_AND_CONTINUE);

    await I.seeInCurrentUrl(`/case/${caseId}/directions-questionnaire/welsh-language`);
    await I.click(paths.options.english_language);
    await I.click(paths.options.document_language);
    clickButton(buttonType.SAVE_AND_CONTINUE);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/task-list`);
  }

  async checkAndSubmit(caseId) {
    await I.click(paths.links.check_and_submit_your_response);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/check-and-send`);
    clickButton(buttonType.SUBMIT_RESPONSE);
  }

  async checkAndSubmitSigned(caseId) {
    await I.click(paths.links.check_and_submit_your_response);
    await I.seeInCurrentUrl(`/case/${caseId}/claimant-response/check-and-send`);
    await I.waitForElement(paths.options.directionsQuestionnaireSigned);
    await I.checkOption(paths.options.directionsQuestionnaireSigned);
    clickButton(buttonType.SUBMIT_RESPONSE);
  }

  async partAdmitSettleClaimConfirmation() {
    await I.see('You\'ve accepted their response');
    await I.see('The claim is now settled. We\'ve emailed Sir John Doe to tell them.');
    await I.see('Go to your account');
  }

  async partAdmitClaimantDoesNotSettleConfirmation() {
    await I.see('You\'ve rejected their response');
    await I.see('What happens next');
    await I.see('We\'ll review the case. We\'ll contact you to tell you what to do next.');
    await I.see('Go to your account');
  }

  async partAdmitClaimantRejectsAndAgreesToMediationConfirmation() {
    await I.see('You\'ve rejected their response');
    await I.see('What happens next');
    await I.see('You agreed to try free mediation.');
    await I.see('Your mediation appointment will be arranged within 28 days.');
  }

  async partAdmitClaimantRequestsCCJConfirmation() {
    await I.see('You\'ve accepted their response');
    await I.see('What happens next');
    await I.see('You\'ve requested a County Court Judgment against the defendant.');
    await I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
  }

  async partAdmitClaimantSignsSettlementAgreementConfirmation() {
    await I.see('You\'ve signed a settlement agreement');
    await I.see('What happens next');
    await I.see('We\'ve emailed Sir John Doe your proposed repayment plan and settlement agreement for them to sign.');
    await I.see('They must respond before 4pm on 13 August 2024. We\'ll email you when they respond.');
    await I.see('If they sign the agreement, this claim is put on hold.');
    await I.see('If they don\'t sign the agreement or reject it, you can request a CCJ against them which orders them to pay in line with the terms of the repayment plan.');
    await I.see('If they don\'t think they can afford the plan, they can ask for a judge to make a different plan.');
  }

  async partAdmitClaimantProposesRepaymentPlanConfirmation() {
    await I.see('You\'ve proposed a different repayment plan');
    await I.see('What happens next');
    await I.see('You\'ve requested a County Court Judgment against Sir John Doe.');
    await I.see('When we\'ve processed your request we\'ll post a copy of judgment to you and to Sir John Doe.');
    await I.see('A judge will decide what Sir John Doe can afford to pay, based on their financial details.');
    await I.see('We\'ll contact both you and Sir John Doe to tell you what to do next.');
  }

  async resetWiremockScenario() {
    await resetScenarios();
  }
}

module.exports = new ClaimantResponseSteps();
