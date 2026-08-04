const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFeesReferenceNumber {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyPageText();
    await this.verifyYesOptionContent();
    await this.verifyNoOptionContent();
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
    await I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyPageText() {
    await I.see('Do you have a help with fees reference number?', 'h2');
    await I.see('Yes');
    await I.see('No');
  }

  async verifyYesOptionContent() {
    await I.click('Yes');
    await I.see('Enter your help with fees reference number');
    await I.see('You\'ll only have this reference number if you\'ve applied for help with fees. Do not submit a number that has already been used for a previous application.');
    await I.see('For example, HWF-A1B-23C');
  }

  async verifyNoOptionContent() {
    await I.click('No');
    await I.see('Next steps');
    await I.see('You must apply for help with fees before submitting your application.');
    await I.see('Go to');
    await I.see('apply for help with fees (opens in a new tab)', '[href=\'https://www.gov.uk/get-help-with-court-fees\']');
    await I.see('When you are asked to enter a court or tribunal number, enter \'hearing fee\' followed by short explanation, for example \'hearing fee for small claims\' or \'hearing fee for fast track\'.');
    await I.see('Complete the help with fees application.');
    await I.see('Return here to your online money claims account.');
    await I.see('Complete the hearing fee payment by entering your help with fees reference number.');
  }

  async addHelpWithFeesReference() {
    await I.fillField('//*[@id="referenceNumber"]', 'HWF-A1B-23C');
  }
}

module.exports = ApplyHelpWithFeesReferenceNumber;
