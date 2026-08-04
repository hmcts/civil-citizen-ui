const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class UnavailableDatesConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(applicationType) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails(applicationType);
    await this.verifyOptions();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('Are there any dates when you cannot attend a hearing within the next 3 months?', 'h1');
  }

  async verifyOptions() {
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = UnavailableDatesConfirmation;
