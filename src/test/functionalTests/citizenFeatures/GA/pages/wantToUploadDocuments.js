const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class WantToUploadDocuments {

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
    await I.see('Do you want to upload documents to support your application?', 'h1');
  }

  async verifyOptions() {
    await I.see('If you\'ve selected multiple applications, you should upload documents that relate to all of them.');
    await I.see('Yes');
    await I.see('No');
  }
}

module.exports = WantToUploadDocuments;
