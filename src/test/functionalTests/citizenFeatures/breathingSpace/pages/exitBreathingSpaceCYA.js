const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  continueButton:
    'button[type="submit"]',
  cancelLink:
    'a[href$="/breathing-space/cancel"]',
};

class ExitBreathingSpaceCheckAnswers {

  async verifyPageContent() {
    await this.verifyHeadingDetails();
    await this.verifyContent();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Breathing space', 'span');
    await I.see('Check your answers', 'h1');
  }

  async verifyContent() {
    await I.see('When will breathing space end?');
    await I.see('Why is breathing space being lifted? (optional)');
    await I.see('Change');
    await I.see('Continue', 'button');
    await I.see('Cancel');
  }

  async clickContinue() {
    await I.click(fields.continueButton);
  }

  async clickCancel() {
    await I.click(fields.cancelLink);
  }
}

module.exports = ExitBreathingSpaceCheckAnswers;
