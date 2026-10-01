const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  startDateDay: 'input[id="startDate-day"]',
  startDateMonth: 'input[id="startDate-month"]',
  startDateYear: 'input[id="startDate-year"]',
  continueButton: 'button[type="submit"]',
  cancelLink: 'a[href$="/breathing-space/cancel"]',
};

class EnterBreathingSpaceStartDate {

  async verifyPageContent(type) {
    await this.verifyHeadingDetails();
    await this.verifyContent(type);
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Enter breathing space', 'span');
    await I.see('Breathing space start date', 'h1');
    await I.see('When did breathing space start? (optional)');
  }

  async verifyContent(type) {
    if (type === 'Standard Breathing Space') {
      await I.see('Breathing space will start from today, unless you enter a different start date.');
    } else {
      await I.see('Mental health crisis breathing space will start from today, unless you enter a different start date.');
      await I.see('It will remain until you lift it.');
    }
    await I.see('Enter the date it started, not the date you received the notification.');
    await I.see('Day');
    await I.see('Month');
    await I.see('Year');
    await I.see('Continue', 'button');
    await I.see('Cancel');
  }

  async enterStartDate(day, month, year) {
    await I.fillField(fields.startDateDay, day);
    await I.fillField(fields.startDateMonth, month);
    await I.fillField(fields.startDateYear, year);
  }

  async enterStartDateDay(day) {
    await I.fillField(fields.startDateDay, day);
  }

  async enterStartDateMonth(month) {
    await I.fillField(fields.startDateMonth, month);
  }

  async enterStartDateYear(year) {
    await I.fillField(fields.startDateYear, year);
  }

  async clickContinue() {
    await I.click(fields.continueButton);
  }

  async clickCancel() {
    await I.click(fields.cancelLink);
  }
}

module.exports = EnterBreathingSpaceStartDate;
