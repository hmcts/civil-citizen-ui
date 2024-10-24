const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingArrangementsGuidance {

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
    I.see('Application hearing arrangements', 'h1');
  }

  async verifyPageText() {
    I.see('You may need to attend an application hearing so that a judge can consider the application with you and the other parties and decide what the next steps should be.');
    await I.see('This hearing is not to discuss the claim. This is a separate hearing to discuss the application.');
  }
}

module.exports = HearingArrangementsGuidance;
