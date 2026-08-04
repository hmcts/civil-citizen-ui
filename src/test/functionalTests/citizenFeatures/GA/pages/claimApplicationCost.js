const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ClaimApplicationCost {

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
    await this.verifyOptions();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('Application costs', 'h1');
  }

  async verifyPageText() {
    await I.see('When a judge makes a decision on your application, they’ll decide who should pay the costs.');
    await I.see('If your application is successful, the other parties may be ordered to pay back your costs associated with the application.');
    await I.see('Costs can include amounts like:');
    await I.see('your application fee', 'li');
    await I.see('loss of earnings and travel costs if you have to attend a hearing', 'li');
    await I.see('You’ll still need to pay the application fee when you submit the application.');
    await I.see('The other parties will be able to see your answer to this question and respond to it.');
  }

  async verifyOptions() {
    await I.see('Do you want to ask for your costs back?', 'h1');
    await I.see('Yes');
    await I.see('No');
  }

  async selectAndVerifyYesOption() {
    await I.click('Yes');
    await I.see('If you know the details of the costs you want to claim back, you can upload a document with a description of these when we ask if you want to upload documents to support your application later on.');
  }
}

module.exports = ClaimApplicationCost;
