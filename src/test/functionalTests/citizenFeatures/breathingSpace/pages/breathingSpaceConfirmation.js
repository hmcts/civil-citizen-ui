const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  returnToCaseSummaryButton:
    'a[href$="/claimantNewDesign"]',
};

class EnterBreathingSpaceConfirmation {

  async verifyPageContent(type) {
    if (type === 'Standard Breathing Space') {
      await I.see('Standard breathing space applied', 'h1');
      await I.see('Breathing space will now be active. You can lift it when you know when it will end.');
    } else {
      await I.see('Mental health breathing space applied', 'h1');
      await I.see('Breathing space will now be active, and remain until you lift breathing space.');
    }
    await I.see('Case number:');
    await I.see('We have sent you a confirmation email.');
    await I.see('What happens next', 'h2');

    await contactUs.verifyContactUs();
  }

  async clickReturnToCaseSummary() {
    await I.click(fields.returnToCaseSummaryButton);
  }
}

module.exports = EnterBreathingSpaceConfirmation;
