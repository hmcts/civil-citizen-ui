const I = actor();
const config = require('../../../../../config');

class ConfirmationPage {
  async verifyConfirmationPage(claimType) {
    I.waitForText('What happens next', config.WaitForText);
    switch (claimType) {
      case 'RejectsAndLessThanClaimAmount': {
        I.see('You told us you\'ve paid the £500 you believe you owe. ' +
          'We\'ve sent Test Inc this response.');
        I.see('If Test Inc accepts your response');
        I.see('The claim will be settled');
        I.see('If Test Inc rejects your response');
        I.see('The next step will be mediation. ' +
          'The mediation service will contact you to give you a date for your appointment.');
        I.see('If you cannot reach an agreement at mediation, the court will review the case.');
        break;
      }
    }
  }
}

module.exports = ConfirmationPage;
