const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

const fields = {
  cancelReason: 'textarea[id="cancelReason"]',
  standardBreathingSpace: 'input[id="type-2"]',
  referenceNumber: 'input[id="reference"]',
  cancelUnissuedClaim: 'button[type="submit"]',
};

class CancelUnissuedClaim {

  async verifyPageContent() {
    await I.see('Reasons for cancelling the claim');
    await I.see('If you cancel the claim, it will not be issued. It will not count as court proceedings. You would not be able to take any further action on it and it will be eventually removed from the system.');
    await I.see('Explain why you are cancelling the claim (optional)');
    await I.see('Cancel unissued claim', 'button');
    await I.see('Cancel');
  }

  async EnterCancelReason(reason) {
    await I.fillField(fields.cancelReason, reason);
  }

  async cancelUnissuedClaim() {
    await I.click(fields.cancelUnissuedClaim);
  }

  async clickCancel() {
    await I.click('Cancel');
  }
}

module.exports = CancelUnissuedClaim;
