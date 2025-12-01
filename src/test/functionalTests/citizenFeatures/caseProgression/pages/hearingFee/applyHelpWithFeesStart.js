const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFeesStart {

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
    I.see('Case number: ' + caseNumber);
    I.see('Claim amount: ' + claimAmount);
  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see('Apply for help with fees', 'h1');
  }

  verifyPageText() {
    I.see('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.');
    I.see('Instead, you should make a new help with fees application which will provide you with a new reference number. Note down this number and keep it safe as you will need it later in the process.');
    I.see('During your application, you will be asked for the number of your court or tribunal form. Enter \'hearing fee\' followed by short explanation, for example \'hearing fee small claims\' or \'hearing fee for fast track\'.');
    I.see('Once you have made your application, return to this page and click continue to proceed.');
    I.see('Apply for Help with Fees (open in a new window)', '//a[@class="govuk-link"]');
  }
}

module.exports = ApplyHelpWithFeesStart;
