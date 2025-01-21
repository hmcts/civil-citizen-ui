const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class UnavailableDatesConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType) {
    await this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months?', 'h1');
  }

  async verifyOptions() {
    I.see('Yes');
    I.see('No');
  }
}

module.exports = UnavailableDatesConfirmation;
