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
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Upload N245 form', 'h1');
  }

  async verifyPageText() {
    I.see('You need to complete the N245 Form and upload it here.');
    I.see('You should set out the new monthly instalments that you\'re proposing in the \'Offer of payment\' section.');
    I.see('We\'ll ask for information about your income and expenses to divide whether these instalments are affordable for you. So it may be useful to have documents like you bank statements to hand.');
    //More text that could be verified if required
    await I.seeElement('//button[contains(text(), \'Upload file\')]');
  }

  async uploadN245() {
    await I.attachFile('#selectedFile', 'citizenFeatures/caseProgression/data/TestPDF.pdf');
    await I.waitForContent('TestPDF.pdf');
    await I.click('Upload file');
    await I.waitForContent('Uploaded files');
  }
}

module.exports = N245Upload;
