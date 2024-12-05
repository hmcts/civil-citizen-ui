const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ResponsenUploadDocuments {

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
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Do you want to upload documents to support your response? (Optional)', 'h1');
  }

  async verifyOptions() {
    I.see('Yes');
    await I.see('No');
  }
}

module.exports = ResponsenUploadDocuments;
