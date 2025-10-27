const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class PayingForApplication {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType, feeAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText(feeAmount);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Paying for your application', 'h1');
  }

  async verifyPageText(feeAmount) {
    I.see('Application fee to pay:', 'h1');
    I.see(`£${feeAmount}`);
    await I.see('You\'ll be asked to pay for your application once it\'s been submitted.');
  }
}

module.exports = PayingForApplication;
