const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  endDateDay: 'input[id="day"]',
  endDateMonth: 'input[id="month"]',
  endDateYear: 'input[id="year"]',
  liftedReason: 'textarea[id="text"]',
  continueButton: 'button[type="submit"]',
  cancelLink: 'a[href$="/breathing-space/cancel"]',
};

class ExitBreathingSpace {

  async verifyPageContent() {
    await this.verifyHeadingDetails();
    await this.verifyContent();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Breathing space', 'span');
    await I.see('Lift breathing space', 'h1');
    await I.see('When will breathing space end?', 'legend');
  }

  async verifyContent() {
    await I.see('This is the date you have been instructed it will be finished, for example');
    await I.see('Why is breathing space being lifted? (optional)');
    await I.see('Day');
    await I.see('Month');
    await I.see('Year');
    await I.see('Continue', 'button');
    await I.see('Cancel');
  }

  async enterExitDate(day, month, year) {
    await I.fillField(fields.endDateDay, day);
    await I.fillField(fields.endDateMonth, month);
    await I.fillField(fields.endDateYear, year);
  }

  async enterLiftReason() {
    await I.fillField(fields.liftedReason, 'testReason');
  }

  async clickContinue() {
    await I.click(fields.continueButton);
  }

  async clickCancel() {
    await I.click(fields.cancelLink);
  }
}

module.exports = ExitBreathingSpace;
