const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpFeeSelection {

  checkPageFullyLoaded () {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber, 'p');
    I.see('Claim amount: ' + claimAmount, 'p');
  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see('Pay hearing fee', 'h1');
  }

  verifyPageText() {
    I.see('If you\'re on a low income, have limited savings or are claiming benefits, you may able to get');
    I.see('If you meet the criteria, you may get support to pay some or all of the fee.');
    I.see('Do you want to apply for help with fees?', 'h3');
    I.see('Yes');
    I.see('No');
  }
}

module.exports = ApplyHelpFeeSelection;
