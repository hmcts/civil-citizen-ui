const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFees {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(feeAmount, caseNumber, claimAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText(feeAmount);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails() {
    await I.see('Hearing', 'span');
    await I.see('Help with fees', 'h1');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber, 'p');
    await I.see('Claim amount: ' + claimAmount, 'p');
  }

  async verifyPageText(feeAmount) {
    await I.see('The hearing fee is: £' + feeAmount,'span');
    await I.see('Applying for help with fees does not guarantee your fee will be covered. You will need to meet the eligibility criteria (opens in new tab).');
    await I.see('Once you apply for help with fees, you should receive a decision from HM Courts and Tribunals Service (HMCTS) within 5 to 10 working days.');
    await I.see('If your application for help with fees is accepted', 'span');
    await I.see('Your fee will be paid in full and you will not need to make a payment.');
    await I.see('If your application for help with fees is partially accepted', 'span');
    await I.see('Some of the fee will be paid, but you\'ll need to pay the remaining balance. You can pay by phone.');
    await I.see('If your application for help with fees is rejected', 'span');
    await I.see('You\'ll need to pay the full balance. You can make the card payment online, or by phone');
    await I.see('Do you want to continue to apply for help with fees?', 'h3');
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = ApplyHelpWithFees;
