const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ViewApplication {

  async checkPageFullyLoaded () {
    await I.waitForText('Respond to application');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent() {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails() {
    await I.see('Application', 'h1');
  }

  async verifyPageText() {
    await I.see('This is the application that the other parties have made.');
    await I.see('Once you\'ve reviewed their application, click \'respond to application\' below. You\'ll be asked whether or not you agree with their request.');
    // Remove the "Respond to an application to" from the start of the application type
    //await I.see(applicationType);
  }
}

module.exports = ViewApplication;
