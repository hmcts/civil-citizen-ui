const I = actor();
const config = require('../../../../../config');

class YourResponse {
  async isDefendantPaid (isPaid) {
    await I.click('Have you been paid the £500?');
    await I.waitForContent('Has the defendant paid you £500?', config.WaitForText);
    await I.click(isPaid);
    await I.click('Save and continue');
  }

  async acceptOrRejectDefendantResponse (isPaid) {
    await I.click('Accept or reject the £500.00');
    await I.waitForContent('Do you want to settle the claim for the', config.WaitForText);
    await I.click(isPaid);
    await I.click('Save and continue');
  }
}

module.exports = YourResponse;
