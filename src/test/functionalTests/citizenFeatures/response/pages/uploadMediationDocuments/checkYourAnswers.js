const I = actor();
const config = require('../../../../../config');

const fields = {
  docSigned: 'input#signed',
};

class CheckYourAnswersPage {
  async checkAndSendMediationDocs(type) {
    await I.waitForContent('Check your answers', config.WaitForText);
    await I.see('Mediation non-attendance');
    await I.see('You cannot withdraw a document once you have submitted it.');
    if (type === 'Claimant') {
      await I.see('Your statement');
      await I.see('Documents referred to in the statement');
      await I.click('Submit');
      await I.waitForContent('Tell us if you confirm the documents are correct.');
    } else {
      await I.see('Your statement');
    }
    await I.checkOption(fields.docSigned);
    await I.click('Submit');
  }
}

module.exports = CheckYourAnswersPage;
