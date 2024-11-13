const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ClaimApplicationCost {

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
    this.verifyPageText();
    await this.verifyOptions();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Application costs', 'h1');
  }

  async verifyPageText() {
    I.see('When a judge makes a decision on your application, they’ll decide who should pay the costs.');
    I.see('If your application is successful, the other parties may be ordered to pay back your costs associated with the application.');
    I.see('Costs can include amounts like:');
    I.see('your application fee', 'li');
    I.see('loss of earnings and travel costs if you have to attend a hearing', 'li');
    I.see('You’ll still need to pay the application fee when you submit the application.');
    await I.see('The other parties will be able to see your answer to this question and respond to it.');
  }

  async verifyOptions() {
    I.see('Do you want to ask for your costs back?', 'h1');
    I.see('Yes');
    await I.see('No');
  }

  async selectAndVerifyYesOption() {
    I.click('Yes');
    await I.see('If you know the details of the costs you want to claim back, you can upload a document with a description of these when we ask if you want to upload documents to support your application later on.');
  }
}

module.exports = ClaimApplicationCost;
