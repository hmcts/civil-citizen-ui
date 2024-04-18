const I = actor();
const ResponseToDefence = require('../pages/responseToDefence');
const responseToDefence = new ResponseToDefence();

const paths = {
  links: {
    view_defendants_response: '//a[.="View the defendant\'s response"]',
    accept_or_reject: '//a[.=\'Accept or reject the £500.00\']',
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
};

class ResponseToDefenceLipVLipSteps {

  async claimantAcceptForDefRespPartAdmitInstallmentsPayment(caseReference, admittedAmount, claimNumber) {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefResponseForPartAdmitInstallmentPayment(admittedAmount);
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_plan);
    await responseToDefence.acceptOrRejectTheAmountDefendantAdmittedAndSettle(admittedAmount, 'accept');
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_payment_plan);
    await responseToDefence.acceptOrRejectTheirRepaymentPlan('reject');
    await this.verifyDashboardLoaded();
    I.click(paths.links.propose_alternative_plan);
    await responseToDefence.proposePaymentPlan();
    await this.verifyDashboardLoaded();
    I.click(paths.links.request_a_CCJ);
    await responseToDefence.verifyCCJ();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersForPartAdmitCCJ();
    responseToDefence.verifyConfirmationScreenForPartAdmitCCJ(claimNumber);
  }

  async claimantRejectForDefRespPartAdmitInstallmentsPayment(caseReference, admittedAmount, fastTrack) {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefResponseForPartAdmitInstallmentPayment(admittedAmount);
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_plan);
    await responseToDefence.acceptOrRejectTheAmountDefendantAdmittedAndSettle(admittedAmount, 'reject');
    if (fastTrack == 'fast') {
      await this.verifyDQForFastTrack();
    } else {
      await this.verifyDQForSmallClaims();
    }
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    await responseToDefence.acceptOrRejectTheAmountCYA('reject');
    await responseToDefence.verifyAcceptOrRejectConfirmationScreen('reject', '1500');
  }

  async claimantAcceptForDefRespPartAdmitImmediatePayment(caseReference, admittedAmount) {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefResponseForPartAdmitImmediatePayment(admittedAmount);
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_plan);
    await responseToDefence.acceptOrRejectTheAmountDefendantAdmittedAndSettle(admittedAmount, 'accept');
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    await responseToDefence.acceptOrRejectTheAmountCYA('accept');
    await responseToDefence.verifyAcceptOrRejectConfirmationScreen('accept', '200.00');
  }

  async claimantRejectForDefRespPartAdmitImmediatePayment(caseReference, admittedAmount) {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefResponseForPartAdmitImmediatePayment(admittedAmount);
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_plan);
    await responseToDefence.acceptOrRejectTheAmountDefendantAdmittedAndSettle(admittedAmount, 'reject');
    await this.verifyDashboardLoaded();
    await this.verifyDQForFastTrack();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    await responseToDefence.acceptOrRejectTheAmountCYA('reject');
    await responseToDefence.verifyAcceptOrRejectConfirmationScreen('reject');
  }

  async ResponseToDefenceStepsAsAnAcceptanceOfSettlementAndRepayment(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForPartAdmit(caseReference);
    await responseToDefence.verifyHowTheyWantToPay(caseReference);
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject);
    await responseToDefence.verifyDoYouWantToSettleTheClaim();
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_payment_plan);
    await responseToDefence.verifyAboutTheRepaymentPlan();
    await this.verifyDashboardLoaded();
    I.click(paths.links.how_to_formalise_repayment);
    await responseToDefence.verifyHowToFormaliseARepayment('settlementAgreement');
    await this.verifyDashboardLoaded();
    I.click(paths.links.sign_a_settlements_agreement);
    await responseToDefence.verifySignTheSettlementAgreement();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersForPartAdmitSettlementAgreement();
    responseToDefence.verifyConfirmationScreenForPartAdmitSettlementAgreement(claimNumber);
  }

  async ResponseToDefenceStepsAsAContinuationWithTheClaimPostDefendantRejection(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejection();
    await this.verifyDashboardLoaded();
    I.click(paths.links.decide_whether_to_proceed);
    await responseToDefence.inputProceedWithTheClaim();
    await this.verifyDashboardLoaded();
    I.click(paths.links.free_mediation);
    await responseToDefence.verifyFreeMediation();
    await responseToDefence.verifyChoseNoFreeMediation();
    await responseToDefence.verifyChoseNoFreeMediationReasons();
    await this.verifyDashboardLoaded();
    await this.verifyDQForSmallClaims();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    await responseToDefence.verifyCheckYourAnswersForMediationHearingExpertsAndLanguage();
    await responseToDefence.verifyConfirmationScreenForRejection(claimNumber);
  }

  async ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateCCJ(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseFullAdmitPayBySetDate();
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_payment_plan);
    await responseToDefence.verifyRepaymentPlanForFullAdmitPayBySetDate();
    await this.verifyDashboardLoaded();
    I.click(paths.links.how_to_formalise_repayment);
    await responseToDefence.verifyHowToFormaliseARepayment('CCJ');
    await this.verifyDashboardLoaded();
    I.click(paths.links.request_a_CCJ);
    await responseToDefence.verifyCCJ();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersForFullAdmitCCJ();
    responseToDefence.verifyConfirmationScreenForFullAdmitCCJ(claimNumber);
  }

  async ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDateSSA(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseFullAdmitPayBySetDate();
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_payment_plan);
    await responseToDefence.verifyRepaymentPlanForFullAdmitPayBySetDate();
    await this.verifyDashboardLoaded();
    I.click(paths.links.how_to_formalise_repayment);
    await responseToDefence.verifyHowToFormaliseARepayment('SSA');
    await this.verifyDashboardLoaded();
    I.click(paths.links.sign_a_settlements_agreement);
    await responseToDefence.verifySignTheSettlementAgreementForFullAdmit();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersForFullAdmitSettlementAgreement();
    responseToDefence.verifyConfirmationScreenForFullAdmitSettlementAgreement(claimNumber);
  }

  async ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceDisputeAll(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejectAllDisputeAll();
    await this.verifyDashboardLoaded();
    I.click(paths.links.decide_whether_to_proceed);
    await responseToDefence.inputNoToProceedWithTheClaim();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersRejectAllNoToProceed();
    responseToDefence.verifyConfirmationScreenForRejectAllNoToProceed(claimNumber);
  }

  async ResponseToDefenceStepsAsAnRejectionOfFullDefenceDisputeAll(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejectAllDisputeAll();
    await this.verifyDashboardLoaded();
    I.click(paths.links.decide_whether_to_proceed);
    await responseToDefence.inputProceedWithTheClaim();
    await this.verifyDashboardLoaded();
    await this.verifyDQForFastTrack();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersRejectAllYesToProceed();
    responseToDefence.verifyConfirmationScreenForRejectAllYesToProceed(claimNumber);
  }

  async ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceAlreadyPaidInFull(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejectAllAlreadyPaidInFull();
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_their_response);
    await responseToDefence.inputSettleWithTheClaimInFull();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersRejectAllSettleClaimInFull();
    responseToDefence.verifyConfirmationScreenForRejectAllSettleClaimInFull(claimNumber);
  }

  async ResponseToDefenceStepsAsAnRejectionOfFullDefenceAlreadyPaidInFull(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejectAllAlreadyPaidInFull();
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_their_response);
    await responseToDefence.inputNotoSettleWithTheClaimInFull();
    await this.verifyDashboardLoaded();
    await this.verifyDQForFastTrack();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersRejectAllNotToSettleClaimInFull();
    responseToDefence.verifyConfirmationScreenForRejectAllYesToProceed(claimNumber);
  }

  async ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceAlreadyPaidNotInFull(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejectAllAlreadyPaidNotInFull();
    await this.verifyDashboardLoaded();
    I.click(paths.links.have_you_been_paid);
    await responseToDefence.paymentNotInFullYesPaid();
    await this.verifyDashboardLoaded();
    I.click(paths.links.settle_the_claim_for);
    await responseToDefence.paymentNotInFullYesToSettle();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersRejectAllSettleClaimNotInFull();
    responseToDefence.verifyConfirmationScreenForRejectAllSettleClaimInFull(claimNumber);
  }

  async ResponseToDefenceStepsAsAnRejectionOfFullDefenceAlreadyPaidNotInFull(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponseForRejectAllAlreadyPaidNotInFull();
    await this.verifyDashboardLoaded();
    I.click(paths.links.have_you_been_paid);
    await responseToDefence.paymentNotInFullYesPaid();
    await this.verifyDashboardLoaded();
    I.click(paths.links.settle_the_claim_for);
    await responseToDefence.paymentNotInFullNoToSettle();
    await this.verifyDashboardLoaded();
    await this.verifyDQForSmallClaims();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswersRejectAllNotToSettleClaimNotInFull();
    responseToDefence.verifyConfirmationScreenForRejectAllYesToProceed(claimNumber);
  }

  async verifyDashboardLoaded() {
    I.waitForContent('Submit', 3);
    I.see('Your response', 'h1');
  }

  async verifyDQForSmallClaims(){
    I.click(paths.links.details_in_case_of_a_hearing);
    await responseToDefence.verifyDeterminationWithoutHearingQuestions();
    await responseToDefence.verifyUsingAnExpertQuestion();
    await responseToDefence.verifyDoYouWantToGiveEvidenceYourself();
    await responseToDefence.verifyDoYouHaveOtherWitness();
    await responseToDefence.verifyAnyDatesInTheNext12Months();
    await responseToDefence.verifyDoYouWantToAskForATelephone();
    await responseToDefence.verifyAreYourExpertsVulnerable();
    await responseToDefence.verifyDoYouOrExpertsNeedToAttendHearing();
    await responseToDefence.verifyHearingAtSpecificCourt();
    await responseToDefence.verifyWelshLanguage();
  }

  async verifyDQForFastTrack(){
    I.click(paths.links.details_in_case_of_a_hearing);
    await responseToDefence.verifyTriedToSettle();
    await responseToDefence.verifyRequestExtra4Weeks();
    await responseToDefence.verifyConsiderClaimantDocuments();
    await responseToDefence.verifyExpertEvidence();
    await responseToDefence.verifySentExpertReports();
    await responseToDefence.verifySharedExpert();
    await responseToDefence.verifyEnterExpertDetails();
    await responseToDefence.verifyGiveEvidenceYourself();
    await responseToDefence.verifyOtherWitnesses();
    await responseToDefence.verifyAnyDatesInTheNext12Months();
    await responseToDefence.verifyDoYouWantToAskForATelephone();
    await responseToDefence.verifyAreYourExpertsVulnerable();
    await responseToDefence.verifyDoYouOrExpertsNeedToAttendHearing();
    await responseToDefence.verifyHearingAtSpecificCourt();
    await responseToDefence.verifyWelshLanguage();
  }

}
module.exports = new ResponseToDefenceLipVLipSteps();
