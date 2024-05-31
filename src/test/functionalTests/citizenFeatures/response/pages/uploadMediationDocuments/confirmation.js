const I = actor();
const config = require('../../../../../config');

class ConfirmationPage {
  async verifyConfirmationPage(claimRef) {
    I.waitForContent('Documents uploaded', config.WaitForText);
    I.see('You can upload more documents now or come back later.');
  }
}

module.exports = ConfirmationPage;
