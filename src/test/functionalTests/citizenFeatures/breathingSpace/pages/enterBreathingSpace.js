const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  mentalHealthCrisisMoratorium: 'input[id="type"]',
  standardBreathingSpace: 'input[id="type-2"]',
  referenceNumber: 'input[id="reference"]',
  continueButton: 'button[type="submit"]',
  cancelLink: 'a[href$="/breathing-space/cancel"]',
};

class EnterBreathingSpace {

  async verifyPageContent() {
    await this.verifyHeadingDetails();
    await this.verifyContent();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Enter breathing space', 'span');
    await I.see('Breathing space type and reference', 'h1');
    await I.see('What type of breathing space is it?');
  }

  async verifyContent() {
    await I.see('Mental Health Crisis Moratorium');
    await I.see('Standard Breathing Space');
    await I.see('Reference number (optional)');
    await I.see('You can find this on the notification you received from the Insolvency Service');
    await I.see('Continue', 'button');
    await I.see('Cancel');
  }

  async selectMentalHealthCrisisMoratorium() {
    await I.checkOption(fields.mentalHealthCrisisMoratorium);
  }

  async selectStandardBreathingSpace() {
    await I.checkOption(fields.standardBreathingSpace);
  }

  async enterReferenceNumber(referenceNumber) {
    await I.fillField(fields.referenceNumber, referenceNumber);
  }

  async clickContinue() {
    await I.click(fields.continueButton);
  }

  async clickCancel() {
    await I.click(fields.cancelLink);
  }
}

module.exports = EnterBreathingSpace;
