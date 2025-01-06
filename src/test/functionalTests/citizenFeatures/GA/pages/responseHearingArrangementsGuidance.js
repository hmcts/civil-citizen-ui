const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ResponseHearingArrangementsGuidance {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Application hearing preferences', 'h1');
  }

  async verifyPageText() {
    I.see('We need to ask for your hearing preferences as a judge usually requires a hearing before making a decision on an application.');
    await I.see('This hearing is only to discuss the application.');
  }
}

module.exports = ResponseHearingArrangementsGuidance;
