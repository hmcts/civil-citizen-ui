const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingArrangement {

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
    await I.see('Application hearing arrangements', 'h1');
  }

  async verifyOptions() {
    await I.see('What type of hearing would you prefer?', 'h1');
    await I.see('In person at the court');
    await I.see('Video Conference');
    await I.see('Telephone');
  }

  async verifyPageText() {
    await I.see('Why would you prefer this type of hearing?');
    await I.seeElement('//*[@id="reasonForPreferredHearingType"]');
    await I.see('If a judge requires the hearing to take place in person at the court, do you have a preferred location? (optional)');
    await I.seeElement('//*[@id="courtLocation"]');
  }

  async fillTextAndSelectLocation(text, location) {
    await I.fillField('#reasonForPreferredHearingType', text);
    await I.selectOption('#courtLocation', location);
  }
}

module.exports = HearingArrangement;
