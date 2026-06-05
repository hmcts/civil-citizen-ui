const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ResponseHearingArrangementsGuidance {

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
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('Application hearing preferences', 'h1');
  }

  async verifyPageText() {
    await I.see('We need to ask for your hearing preferences as a judge usually requires a hearing before making a decision on an application.');
    await I.see('This hearing is only to discuss the application.');
  }
}

module.exports = ResponseHearingArrangementsGuidance;
