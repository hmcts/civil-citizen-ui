const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HearingSupport {

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
    I.see('Adjustments or support to attend a hearing', 'h1');
  }

  async verifyPageText() {
    I.see('If you need a sign language or language interpreter', 'p');
    I.see('You\'ll need to arrange your own language interpreter.');
    I.see('If you\'re not able to arrange your own interpreter, the court may be able to arrange one for you.');
    I.see('If you\'ll be arranging your own interpreter, you still need to tell us what language you\'ll be using by ticking the \'Language interpreter\' box below.');
    I.see('Find out how to get an interpreter at a court or tribunal.');
    await I.seeElement('//a[contains(text(), \'get an interpreter at a court or tribunal\')]');
  }

  async verifyOptions() {
    I.see('Do you need any adjustments or support to attend a hearing (optional)?');
    I.see('Select all that apply');
    I.see('Step-free access', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    I.see('Hearing loop', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    I.see('Sign language interpreter', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    I.see('Language interpreter', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
    await I.see('Other support', '//label[@class=\'govuk-label govuk-checkboxes__label\']');
  }
}

module.exports = HearingSupport;
