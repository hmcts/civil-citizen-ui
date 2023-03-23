
const I = actor();

class MediationCanWeUse {

  enterPhoneNumber() {
    I.see('Enter a phone number', 'h1');
    I.fillField('input[id="telephoneNumber"]', '02088908876');
    I.click('Save and continue');
  }
}

module.exports = MediationCanWeUse;
