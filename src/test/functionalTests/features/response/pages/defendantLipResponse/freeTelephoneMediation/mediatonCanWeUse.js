
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  phoneNumberID: 'input[id="mediationPhoneNumber"]',
};

class MediationCanWeUse {

  async selectOptionForMediation() {
    //Uncomment the below steps once the issue is fixed.
    // await I.see('Confirm your telephone number', 'h1');
    // await I.see('Can the mediation service use');
    // await I.click(fields.yesButton);

    await I.see('Enter a phone number', 'h1');
    await I.see('Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.');
    await I.fillField(fields.phoneNumberID, '02088008800');

    await I.see('Confirm your telephone number', 'h1');
    await I.see('Can the mediation service use');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = MediationCanWeUse;
