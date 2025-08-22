const I = actor();
const config = require('../../../../../config');

class ConfirmationPage {
  async verifyConfirmationPage(claimType) {
    I.waitForContent('What happens next', config.WaitForText);
    switch (claimType) {
      case 'RejectsAndLessThanClaimAmount': {
        I.see('You told us you\'ve paid the £500 you believe you owe. ' +
          'We\'ve sent Test Company Claimant this response.');
        I.see('If Test Company Claimant accepts your response');
        I.see('The claim will be settled');
        I.see('If Test Company Claimant rejects your response');
        break;
      }
      case 'PartAdmitAndPayImmediately': {
        I.see('You\'ve said you owe £500.00 plus the claim fee and any fixed costs claimed and offered to pay Miss Jane Doe immediately.');
        break;
      }
    }
    I.see('The next step will be mediation. ' +
      'The mediation service will contact you to give you a date for your appointment.');
    I.see('If you cannot reach an agreement at mediation, the court will review the case.');
  }

  async verifyQMMessageConfirmation() {
    await I.waitForContent('Message sent', config.WaitForText);
    await I.see('Your message has been sent to the court');
    await I.see('What happens next');
    await I.see('Our team will read your message and try to respond within 10 working days.');
    await I.see('You will be notified when the court responds to your message and you will be able to view it from your dashboard.');
    await I.see('Go to your dashboard');
  }
}

module.exports = ConfirmationPage;
