const I = actor();
const ResponseToDefence = require('../pages/responseToDefence');
const responseToDefence = new ResponseToDefence();

const paths = {
  links: {
    view_defendants_response: '//a[.="View the defendant\'s response"]',
    accept_or_reject: '//a[.=\'Accept or reject the £500.00\']',
    accept_or_reject_the_payment_plan: '//a[contains(.,\'Accept or reject their repayment plan\')]',
    how_to_formalise_repayment: '//a[.=\'Choose how to formalise repayment\']',
    sign_a_settlements_agreement: '//a[.=\'Sign a settlement agreement\']',
    request_a_CCJ: '//a[.=\'Request a County Court Judgment\']',
    check_and_submit_your_response : '//a[.=\'Check and submit your response\']',
    decide_whether_to_proceed : '//a[.=\'Decide whether to proceed\']',
    free_mediation:'//a[.=\'Free telephone mediation\']',
    details_in_case_of_a_hearing : '//a[.="Give us details in case there\'s a hearing"]',
  },
};

class ResponseToDefenceLipVLipSteps {

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

  async ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDate(caseReference, claimNumber)
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

  async verifyDashboardLoaded() {
    I.waitForText('Submit', 3);
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
