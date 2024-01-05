const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  phoneNumberID: 'input[id="mediationPhoneNumber"]',
};

class MediationCanWeUse {

  async selectOptionForMediation() {
    // await I.see('Confirm your telephone number', 'h1');
    // await I.see('Can the mediation service use');
    // await I.click(fields.yesButton);
    await I.waitForText('Enter a phone number', config.WaitForText);
    await I.see('Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.');
    await I.fillField(fields.phoneNumberID, '02088008800');
    await I.click('Save and continue');
  }

  async selectOptionForMediationError() {
    await I.waitForText('Enter a phone number', config.WaitForText);
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Please enter a phone number');
  }
}

module.exports = MediationCanWeUse;
