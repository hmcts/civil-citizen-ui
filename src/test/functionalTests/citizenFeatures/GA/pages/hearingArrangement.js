const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingArrangement {

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
    I.see('Application hearing arrangements', 'h1');
  }

  async verifyOptions() {
    I.see('What type of hearing would you prefer?', 'h1');
    I.see('In person at the court');
    I.see('Video Conference');
    await I.see('Telephone');
  }

  async verifyPageText() {
    I.see('Why would you prefer this type of hearing?');
    I.seeElement('//*[@id="reasonForPreferredHearingType"]');
    I.see('If a judge requires the hearing to take place in person at the court, do you have a preferred location? (optional)');
    await I.seeElement('//*[@id="courtLocation"]');
  }

  async fillTextAndSelectLocation(text, location) {
    await I.fillField('#reasonForPreferredHearingType', text);
    await I.selectOption('#courtLocation', location);
  }
}

module.exports = HearingArrangement;
