const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplyHelpWithFeesStart {

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
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber);
    await I.see('Claim amount: ' + claimAmount);
  }

  async verifyHeadingDetails() {
    await I.see('Hearing', 'span');
    await I.see('Apply for help with fees', 'h1');
  }

  async verifyPageText() {
    await I.see('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.');
    await I.see('Instead, you should make a new help with fees application which will provide you with a new reference number. Note down this number and keep it safe as you will need it later in the process.');
    await I.see('During your application, you will be asked for the number of your court or tribunal form. Enter \'hearing fee\' followed by short explanation, for example \'hearing fee small claims\' or \'hearing fee for fast track\'.');
    await I.see('Once you have made your application, return to this page and click continue to proceed.');
    await I.see('Apply for Help with Fees (open in a new tab)', '//a[@class="govuk-link"]');
  }
}

module.exports = ApplyHelpWithFeesStart;
