const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class PayingForApplication {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(applicationType, feeAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails(applicationType);
    await this.verifyPageText(feeAmount);
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('Paying for your application', 'h1');
  }

  async verifyPageText(feeAmount) {
    await I.see('Application fee to pay:', 'h1');
    await I.see(`£${feeAmount}`);
    await I.see('You\'ll be asked to pay for your application once it\'s been submitted.');
  }
}

module.exports = PayingForApplication;
