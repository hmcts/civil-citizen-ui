const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class UnavailableDates {

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

  async fillFields() {
    const newDate = new Date(new Date().setMonth(new Date().getMonth()+2));
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();

    await I.click('#items-0-single-date');
    await I.fillField('input[name="items[0][single][start][day]"]', 1);
    await I.fillField('input[name="items[0][single][start][month]"]', month);
    await I.fillField('input[name="items[0][single][start][year]"]', year);
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType) {
    await I.see(applicationType, 'h1');
    await I.see('Are there any dates when you cannot attend a hearing within the next 3 months?', 'h1');
  }

  async verifyPageText() {
    await I.see('These should only be the dates of important events like medical appointments, other court hearings, or holidays you\'ve already booked.');
    await I.seeElement('//button[contains(text(), \'Add another date or date range\')]');
  }

  async verifyOptions() {
    await I.see('Select a date or dates you cannot attend a hearing');
    await I.see('Single date');
    await I.see('Longer period of time');
  }
}

module.exports = UnavailableDates;
