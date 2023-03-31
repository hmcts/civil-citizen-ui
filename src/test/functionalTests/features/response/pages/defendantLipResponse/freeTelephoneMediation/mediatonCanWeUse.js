
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  phoneNumberID: 'input[id="mediationPhoneNumber"]',
};

class MediationCanWeUse {

  selectOptionForMediation() {
    //Uncomment the below steps once the issue is fixed.
    // I.see('Confirm your telephone number', 'h1');
    // I.see('Can the mediation service use');
    // I.click(fields.yesButton);

    I.see('Enter a phone number', 'h1');
    I.see('Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.');
    I.fillField(fields.phoneNumberID, '02088008800');

    I.click('Save and continue');
  }
}

module.exports = MediationCanWeUse;
