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

  verifyPageContent(feeAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyPageText(feeAmount);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//*[@id="main-content"]/div/main/div/div[1]/div[1]/a');
  }

  verifyHeadingDetails() {
    I.see('Hearing fee', 'span');
    I.see('Help with fees', 'h1');
  }

  verifyPageText(feeAmount) {
    I.see('The hearing fee is: £' + feeAmount,'span');
    I.see('Applying for help with fees does not guarantee your fee will be covered. You will need to meet the eligibility criteria (opens in new tab).');
    I.seeElement('//*[@id="main-content"]/div/main/div/div[1]/p[1]/a');
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
