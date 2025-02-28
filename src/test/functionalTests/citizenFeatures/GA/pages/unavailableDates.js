const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class UnavailableDates {

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

  fillFields() {
    const newDate = new Date(new Date().setMonth(new Date().getMonth()+2));
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();

    I.click('#items-0-single-date');
    I.fillField('input[name="items[0][single][start][day]"]', 1);
    I.fillField('input[name="items[0][single][start][month]"]', month);
    I.fillField('input[name="items[0][single][start][year]"]', year);
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see(applicationType, 'h1');
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months?', 'h1');
  }

  async verifyPageText() {
    I.see('These should only be the dates of important events like medical appointments, other court hearings, or holidays you\'ve already booked.');
    await I.seeElement('//button[contains(text(), \'Add another date or date range\')]');
  }

  async verifyOptions() {
    I.see('Select a date or dates you cannot attend a hearing');
    I.see('Single date');
    await I.see('Longer period of time');
  }
}

module.exports = UnavailableDates;
