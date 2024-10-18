const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFees {

  checkPageFullyLoaded () {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(feeAmount, caseNumber, claimAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyPageText(feeAmount);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see('Help with fees', 'h1');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber, 'p');
    I.see('Claim amount: ' + claimAmount, 'p');
  }

  verifyPageText(feeAmount) {
    I.see('The hearing fee is: £' + feeAmount,'span');
    I.see('Applying for help with fees does not guarantee your fee will be covered. You will need to meet the eligibility criteria (opens in new tab).');
    I.see('Once you apply for help with fees, you should receive a decision from HM Courts and Tribunals Service (HMCTS) within 5 to 10 working days.');
    I.see('If your application for help with fees is accepted', 'span');
    I.see('Your fee will be paid in full and you will not need to make a payment.');
    I.see('If your application for help with fees is partially accepted', 'span');
    I.see('Some of the fee will be paid, but you\'ll need to pay the remaining balance. You can pay by phone.');
    I.see('If your application for help with fees is rejected', 'span');
    I.see('You\'ll need to pay the full balance. You can make the card payment online, or by phone');
    I.see('Do you want to continue to apply for help with fees?', 'h3');
    I.see('Yes');
    I.see('No');
  }
}

module.exports = ApplyHelpWithFees;
