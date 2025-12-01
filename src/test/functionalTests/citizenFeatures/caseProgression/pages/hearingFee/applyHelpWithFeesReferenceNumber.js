const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFeesReferenceNumber {

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
    this.verifyYesOptionContent();
    this.verifyNoOptionContent();
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
    I.see('Case number: ' + caseNumber);
    I.see('Claim amount: ' + claimAmount);
  }

  verifyPageText() {
    I.see('Do you have a help with fees reference number?', 'h2');
    I.see('Yes');
    I.see('No');
  }

  verifyYesOptionContent() {
    I.click('Yes');
    I.see('Enter your help with fees reference number');
    I.see('You\'ll only have this reference number if you\'ve applied for help with fees. Do not submit a number that has already been used for a previous application.');
    I.see('For example, HWF-A1B-23C');
  }

  verifyNoOptionContent() {
    I.click('No');
    I.see('Next steps');
    I.see('You must apply for help with fees before submitting your application.');
    I.see('Go to');
    I.see('apply for help with fees (opens in a new tab)', '[href=\'https://www.gov.uk/get-help-with-court-fees\']');
    I.see('When you are asked to enter a court or tribunal number, enter \'hearing fee\' followed by short explanation, for example \'hearing fee for small claims\' or \'hearing fee for fast track\'.');
    I.see('Complete the help with fees application.');
    I.see('Return here to your online money claims account.');
    I.see('Complete the hearing fee payment by entering your help with fees reference number.');
  }

  addHelpWithFeesReference() {
    I.fillField('//*[@id="referenceNumber"]', 'HWF-A1B-23C');
  }
}

module.exports = ApplyHelpWithFeesReferenceNumber;
