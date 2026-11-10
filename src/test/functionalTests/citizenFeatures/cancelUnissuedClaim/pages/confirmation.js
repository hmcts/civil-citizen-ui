const I = actor();
const config = require('../../../../config');

class ConfirmationPage {
  async verifyConfirmationPage() {
    await I.waitForContent('This claim has been cancelled', config.WaitForText);
    await I.see('What happens next');
    await I.see('No further action can be taken on this case. You can start a new claim by going to your account.')
  }

  async clickGoToYourAccount() {
    await I.click('Go to your account');
  }
}

module.exports = ConfirmationPage;
