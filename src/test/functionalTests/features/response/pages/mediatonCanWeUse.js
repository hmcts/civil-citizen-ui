
const I = actor();

class MediaTonCanWeUse {

  selectEvidenceFromDropDown() {    
    I.see('Enter a phone number', 'h1');
    I.fillField('input[id="telephoneNumber"]', '02088908876');
    I.click('Save and continue');
  }
}

module.exports = MediaTonCanWeUse;