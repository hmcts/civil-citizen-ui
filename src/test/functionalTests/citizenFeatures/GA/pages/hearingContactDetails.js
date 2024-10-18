const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingContactDetails {

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
    I.see('Contact Details', 'h1');
  }

  async verifyPageText() {
    I.see('Preferred telephone number');
    I.seeElement('//*[@id="telephoneNumber"]');
    I.see('Preferred email address');
    await I.seeElement('//*[@id="emailAddress"]');
  }

  async fillContactDetails(phoneNumber, emailAddress) {
    await I.fillField('#telephoneNumber', phoneNumber);
    await I.fillField('#emailAddress', emailAddress);
  }
}

module.exports = HearingContactDetails;
