
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  phoneNumberID: 'input[id="mediationPhoneNumber"]',
};

class MediationCanWeUse {

  async selectOptionForMediation() {
    await I.see('Confirm your telephone number', 'h1');
    await I.see('Can the mediation service use');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = MediationCanWeUse;
