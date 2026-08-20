const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  continueButton:
    'button[type="submit"]',
  cancelLink:
    'a[href$="/breathing-space/cancel"]',
};

class EnterBreathingSpaceCheckAnswers {

  async verifyPageContent() {
    await this.verifyHeadingDetails();
    await this.verifyContent();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Enter breathing space', 'span');
    await I.see('Check your answers', 'h1');
  }

  async verifyContent() {
    await I.see('What type is it?');
    await I.see('Reference number (optional)');
    await I.see('Start date (optional)');
    await I.see('Change');
    await I.see('Continue', 'button');
    await I.see('Cancel');
  }

  async verifyBreathingSpaceType(type) {
    if(type === 'Standard Breathing Space'){
      await I.see(type, '.govuk-summary-list__value');
    }else{
      await I.see('Mental Health Crisis Moratorium', '.govuk-summary-list__value');
    }
  }

  async verifyReferenceNumber(referenceNumber) {
    await I.see(referenceNumber, '.govuk-summary-list__value');
  }

  async verifyStartDate(startDate) {
    await I.see(startDate, '.govuk-summary-list__value');
  }

  async verifyCheckYourAnswers(type, referenceNumber, startDate) {
    await this.verifyBreathingSpaceType(type);
    await this.verifyReferenceNumber(referenceNumber);
    await this.verifyStartDate(startDate);
  }

  async clickContinue() {
    await I.click(fields.continueButton);
  }

  async clickCancel() {
    await I.click(fields.cancelLink);
  }
}

module.exports = EnterBreathingSpaceCheckAnswers;
