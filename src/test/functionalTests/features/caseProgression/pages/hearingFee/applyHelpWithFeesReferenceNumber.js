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

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyPageText();
    this.verifyYesOptionContent();
    this.verifyNoOptionContent();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//*[@id="main-content"]/div/main/div/div[1]/div[1]/a');
  }

  verifyHeadingDetails() {
    I.see('Hearing fee', 'span');
    I.see('Help with fees', 'h1');
  }

  verifyPageText() {
    I.see('Do you have a help with fees reference number?', 'h3');
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
    I.see('apply for help with fees (opens in a new tab).', '[href=\'https://www.gov.uk/get-help-with-court-fees\']');
    I.see('When you are asked to enter a court or tribunal number, enter \'hearing fee\' followed by short explanation, for example \'hearing fee for small claims\' or \'hearing fee for fast track.');
    I.see('Complete the help with fees application.');
    I.see('Return here to your online money claims account.');
    I.see('Complete the hearing fee payment by entering your help with fees reference number.');
  }

  addHelpWithFeesReference() {
    I.fillField('//*[@id="referenceNumber"]', 'HWF-A1B-23C');
  }
}

module.exports = ApplyHelpWithFeesReferenceNumber;
