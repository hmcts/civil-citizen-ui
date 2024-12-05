const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class RespondentAgreement {

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
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Do you agree that the court should make the order that the other parties have requested?', 'h1');
  }

  async verifyPageText() {
    await I.see('Make sure you\'ve reviewed the full application. If you disagree with any part of the application, select \'No\' and explain why.');
  }
}

module.exports = RespondentAgreement;
