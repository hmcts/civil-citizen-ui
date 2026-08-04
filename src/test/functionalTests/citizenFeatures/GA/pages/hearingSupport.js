const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingSupport {

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
    await I.see('Adjustments or support to attend a hearing', 'h1');
  }

  async verifyPageText() {
    await I.see('If you need a sign language or language interpreter', 'p');
    await I.see('You\'ll need to arrange your own language interpreter.');
    await I.see('If you\'re not able to arrange your own interpreter, the court may be able to arrange one for you.');
    await I.see('If you\'ll be arranging your own interpreter, you still need to tell us what language you\'ll be using by ticking the \'Language interpreter\' box below.');
    await I.see('Find out how to get an interpreter at a court or tribunal.');
    await I.seeElement('//a[contains(text(), \'get an interpreter at a court or tribunal\')]');
  }

  async verifyOptions() {
    await I.see('Do you need any adjustments or support to attend a hearing (optional)?');
    await I.see('Select all that apply');
    await I.see('Step-free access', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    await I.see('Hearing loop', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    await I.see('Sign language interpreter', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    await I.see('Language interpreter', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    await I.see('Other support', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
  }
}

module.exports = HearingSupport;
