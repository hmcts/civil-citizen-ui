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
    await responseToDefence.verifyDefendantsResponse(caseReference);
    await responseToDefence.verifyHowTheyWantToPay(caseReference);
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject);
    await responseToDefence.verifyDoYouWantToSettleTheClaim();
    await this.verifyDashboardLoaded();
    I.click(paths.links.accept_or_reject_the_payment_plan);
    await responseToDefence.verifyAboutTheRepaymentPlan();
    await this.verifyDashboardLoaded();
    I.click(paths.links.how_to_formalise_repayment);
    await responseToDefence.verifyHowToFormaliseARepayment();
    await this.verifyDashboardLoaded();
    I.click(paths.links.sign_a_settlements_agreement);
    await responseToDefence.verifySignTheSettlementAgreement();
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    responseToDefence.verifyCheckYourAnswers();
    responseToDefence.verifyConfirmationScreen(claimNumber);
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
    await this.verifyDashboardLoaded();
    I.click(paths.links.check_and_submit_your_response);
    await responseToDefence.verifyCheckYourAnswersForMediationHearingExpertsAndLanguage();
    await responseToDefence.verifyConfirmationScreenForRejection(claimNumber);

  }

  async verifyDashboardLoaded() {
    I.waitForText('Submit', 3);
    I.see('Your response', 'h1');
  }

}
module.exports = new ResponseToDefenceLipVLipSteps();
