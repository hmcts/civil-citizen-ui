const I = actor();
const config = require('../../../../../config');

class ConfirmationPage {
  async verifyConfirmationPage(claimRef) {
    I.waitForContent('Documents uploaded', config.WaitForText);
    I.see('You can upload more documents now or come back later.');
    I.click('View documents');
    I.amOnPage('/case/' + claimRef + '/mediation/view-mediation-documents');
    I.see('View mediation documents');
  }
}

module.exports = ConfirmationPage;
