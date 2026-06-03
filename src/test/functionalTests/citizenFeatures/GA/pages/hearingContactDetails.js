const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingContactDetails {

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
    await I.see('Contact Details', 'h1');
  }

  async verifyPageText() {
    await I.see('Preferred telephone number');
    await I.seeElement('//*[@id="telephoneNumber"]');
    await I.see('Preferred email address');
    await I.seeElement('//*[@id="emailAddress"]');
  }

  async fillContactDetails(phoneNumber, emailAddress) {
    await I.fillField('#telephoneNumber', phoneNumber);
    await I.fillField('#emailAddress', emailAddress);
  }
}

module.exports = HearingContactDetails;
