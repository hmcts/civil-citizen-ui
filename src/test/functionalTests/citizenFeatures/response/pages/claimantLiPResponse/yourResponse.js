const I = actor();
const config = require('../../../../../config');

const fields = {
  responseTextArea: '#text',
};

class YourResponse {
  async isDefendantPaid(isPaid, amount = 500) {
    await I.click(`Have you been paid the £${amount}?`);
    await I.waitForContent(`Has the defendant paid you £${amount}?`, config.WaitForText);
    await I.click(isPaid);
    await I.click('Save and continue');
  }

  async acceptOrRejectDefendantResponse (isPaid) {
    await I.click('Accept or reject the £500.00');
    await I.waitForContent('Do you want to settle the claim for the', config.WaitForText);
    await I.click(isPaid);
    await I.click('Save and continue');
  }

  async settleTheClaim (isPaid, amount) {
    await I.click(`Settle the claim for £${amount}?`);
    await I.waitForContent('Do you want to settle the claim for the', config.WaitForText);
    await I.click(isPaid);
    await I.click('Save and continue');
    await I.waitForContent('Why did you reject their response?', config.WaitForText);
    await I.fillField(fields.responseTextArea, 'Test test');
    await I.click('Save and continue');
  }
}

module.exports = YourResponse;
