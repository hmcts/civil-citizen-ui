const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingArrangementsGuidance {

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
    await I.see('Application hearing arrangements', 'h1');
  }

  async verifyPageText() {
    await I.see('You may need to attend an application hearing so that a judge can consider the application with you and the other parties and decide what the next steps should be.');
    await I.see('This hearing is not to discuss the claim. This is a separate hearing to discuss the application.');
  }
}

module.exports = HearingArrangementsGuidance;
