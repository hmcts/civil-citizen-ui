const I = actor();
const config = require('../../../../../../config');

const fields = {
  docSigned: 'input#signed',
};


class CheckYourAnswersPage {
  async checkAndSendMediationDocs() {
    I.waitForContent('Check your answers', config.WaitForText);
    I.see('Mediation non-attendance');
    I.see('You cannot withdraw a document once you have submitted it.');
    I.see('Your statement');
    I.see('Documents referred to in the statement');
    I.click('Submit');
    I.waitForContent('Tell us if you confirm the documents are correct.');
    I.checkOption(fields.docSigned);
    I.click('Submit');
  }
}

module.exports = CheckYourAnswersPage;
