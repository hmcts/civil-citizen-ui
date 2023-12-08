const I = actor();
const config = require('../../../../../../config');

class PhoneConfirmation {

  async confirmPhone(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/mediation/phone-confirmation');
    await I.waitForText('Can the mediator use', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click('Yes');
    await I.click('Save and continue');
  }
}

module.exports = PhoneConfirmation;
