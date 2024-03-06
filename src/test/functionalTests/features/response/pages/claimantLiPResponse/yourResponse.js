const I = actor();
const config = require("../../../../../config");

class YourResponse {
  async isDefendantPaid (isPaid) {
    await I.click('Have you been paid the £500?');
    await I.waitForText('Has the defendant paid you £500?', config.WaitForText);
    await I.click(isPaid);
    await I.click('Save and continue');
  }
}

module.exports = YourResponse;
