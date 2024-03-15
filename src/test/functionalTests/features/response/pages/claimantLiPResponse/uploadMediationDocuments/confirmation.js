const I = actor();
const config = require('../../../../../../config');

class ConfirmationPage {
  async verifyConfirmationPage() {
    I.waitForContent('Documents uploaded', config.WaitForText);
    I.see('You can upload more documents now or come back later.');
    I.see('If you cannot reach an agreement at mediation, the court will review the case.');
    I.click('View documents');
    I.waitForContent('Upload your documents', config.WaitForText);
    I.see('Deadlines for uploading documents');
  }
}

module.exports = ConfirmationPage;
