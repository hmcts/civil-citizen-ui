const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class AddAnotherApplication {

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
    await I.see(applicationType, 'span');
    await I.see('Do you want to add another application?', 'h1');
  }

  async verifyOptions() {
    await I.see('There’s no additional fee for making more than one application.');
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = AddAnotherApplication;
