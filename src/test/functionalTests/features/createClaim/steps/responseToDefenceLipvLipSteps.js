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
  },
};

class ResponseToDefenceLipVLipSteps {

  async ResponseToDefenceSteps(caseReference, claimNumber)
  {
    await responseToDefence.open(caseReference);
    await responseToDefence.verifyDashboard();
    I.click(paths.links.view_defendants_response);
    await responseToDefence.verifyDefendantsResponse(caseReference);
    await responseToDefence.verifyHowTheyWantToPay();
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

  async verifyDashboardLoaded() {
    I.waitForText('Submit', 3);
    I.see('Your response', 'h1');
  }

}
module.exports = new ResponseToDefenceLipVLipSteps();
