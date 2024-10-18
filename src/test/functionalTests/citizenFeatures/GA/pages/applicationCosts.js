const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplicationCosts {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[contains(text(), \'Start now\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see('Make an application', 'h1');
    I.see(applicationType, 'h1');
  }

  async verifyPageText() {
    //I.see('To apply to extend time, the application fee is £119. If you\'ll be selecting multiple applications, this fee may be reduced.');
    await I.see('This fee will need to be paid once you\'ve created the application. If you\'re eligible, you may be able to apply for help with fees.');
  }
}

module.exports = ApplicationCosts;
