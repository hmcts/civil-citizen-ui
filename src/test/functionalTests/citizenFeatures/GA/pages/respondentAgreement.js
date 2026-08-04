const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class RespondentAgreement {

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
    await I.see('Do you agree that the court should make the order that the other parties have requested?', 'h1');
  }

  async verifyPageText() {
    await I.see('Make sure you\'ve reviewed the full application. If you disagree with any part of the application, select \'No\' and explain why.');
  }
}

module.exports = RespondentAgreement;
