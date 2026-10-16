const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  returnToCaseSummaryButton:
    'a[href$="/claimantNewDesign"]',
};

class ExitBreathingSpaceConfirmation {
  async verifyPageContent(type, futureExit) {
    if (type === 'Standard Breathing Space') {
      if (futureExit) {
        await I.see('Standard breathing space will lift on', 'h1');
        await I.see('We will send you an email to confirm when breathing space has ended');
      }else {
        await I.see('Standard breathing space lifted', 'h1');
        await I.see('We have sent you a confirmation email.');
      }
    } else {
      if (futureExit) {
        await I.see('Mental health breathing space will lift on', 'h1');
        await I.see('We will send you an email to confirm when breathing space has ended');
      } else {
        await I.see('Mental health breathing space lifted', 'h1');
        await I.see('We have sent you a confirmation email.');
      }
    }
    await contactUs.verifyContactUs();
  }

  async clickReturnToCaseSummary() {
    await I.click(fields.returnToCaseSummaryButton);
  }
}

module.exports = ExitBreathingSpaceConfirmation;
