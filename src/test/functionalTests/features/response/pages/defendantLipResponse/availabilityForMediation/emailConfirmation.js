const I = actor();
const config = require('../../../../../../config');

class EmailConfirmation {

  async confirmEmail(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/mediation/email-confirmation');
    await I.waitForText('Can the mediation team use', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click('Yes');
    await I.click('Save and continue');
  }
}

module.exports = EmailConfirmation;
