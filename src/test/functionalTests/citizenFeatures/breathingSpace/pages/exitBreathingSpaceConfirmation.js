const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  returnToCaseSummaryButton:
    'a[href$="/claimantNewDesign"]',
};

class ExitBreathingSpaceConfirmation {

  async verifyPageContent(type) {
    if (type === 'Standard Breathing Space') {
      await I.see('Standard breathing space lifted', 'h1');
      await I.see('We have sent you a confirmation email.');
    } else {
      await I.see('Mental health breathing space lifted', 'h1');
      await I.see('We have sent you a confirmation email.');
    }
    await contactUs.verifyContactUs();
  }

  async clickReturnToCaseSummary() {
    await I.click(fields.returnToCaseSummaryButton);
  }
}

module.exports = ExitBreathingSpaceConfirmation;
