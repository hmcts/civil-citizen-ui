const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewApplication {

  async checkPageFullyLoaded () {
    await I.waitForText('Respond to application');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see('Application', 'h1');
  }

  async verifyPageText() {
    I.see('This is the application that the other parties have made.');
    await I.see('Once you\'ve reviewed their application, click \'respond to application\' below. You\'ll be asked whether or not you agree with their request.');
    // Remove the "Respond to an application to" from the start of the application type
    //await I.see(applicationType);
  }
}

module.exports = ViewApplication;
