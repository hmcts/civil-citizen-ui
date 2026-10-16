const ContactUs = require('../../common/contactUs');
const I = actor();
const contactUs = new ContactUs();

class N245Upload {

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
    await I.see('Upload N245 form', 'h1');
  }

  async verifyPageText() {
    await I.see('You need to complete the N245 Form and upload it here.');
    await I.see('You should set out the new monthly instalments that you\'re proposing in the \'Offer of payment\' section.');
    await I.see('We\'ll ask for information about your income and expenses to divide whether these instalments are affordable for you. So it may be useful to have documents like you bank statements to hand.');
    //More text that could be verified if required
    await I.seeElement('//button[contains(@class, \'govuk-file-upload-button\')]');
  }

  async uploadN245() {
    await I.attachFile('input[name="selectedFile"]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPDF.pdf');
    await I.waitForContent('Uploaded files');
    await I.see('TestPDF.pdf', '//dl[contains(@class, \'govuk-summary-list\')]');
  }
}

module.exports = N245Upload;
