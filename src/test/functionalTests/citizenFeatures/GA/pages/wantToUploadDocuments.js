const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class WantToUploadDocuments {

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
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('More time to do what is required by a court order', 'h1');
    I.see('Do you want to upload documents to support your application? (Optional)', 'h1');
  }

  async verifyOptions() {
    I.see('If you\'ve selected multiple applications, you should upload documents that relate to all of them.');
    I.see('Yes');
    await I.see('No');
  }
}

module.exports = WantToUploadDocuments;
