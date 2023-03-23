
const I = actor();

class FreeTelephoneMediation {

  selectMediation(claimRef) {
    I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    I.see('Free telephone mediation', 'h1');
    I.click('Continue');
    I.see('Enter a phone number', 'h1');
    I.fillField('input[id="mediationPhoneNumber"]', '02088908876');
    I.click('Save and continue');
  }
}

module.exports = FreeTelephoneMediation;
