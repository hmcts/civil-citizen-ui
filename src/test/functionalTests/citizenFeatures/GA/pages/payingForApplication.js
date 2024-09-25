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

  async verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('More time to do what is required by a court order', 'h1');
    I.see('Paying for your application', 'h1');
  }

  async verifyPageText() {
    I.see('Application fee to pay:', 'h1');
    I.see('£119');
    await I.see('You\'ll be asked to pay for your application once it\'s been submitted.');
  }
}

module.exports = PayingForApplication;
