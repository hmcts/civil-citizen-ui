const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  details: 'textarea[id="details"]',
};

class PhoneOrVideoHearing {

  async selectOptionForPhoneOrVideoHearing() {
    await I.waitForText('Do you want to ask for a telephone or video hearing?', config.WaitForText);
    await I.see('The judge will decide if the hearing can be held by telephone or video.');
    await I.click(fields.yesButton);
    await I.fillField(fields.details, 'Test details');
    await I.click('Save and continue');
  }
}

module.exports = PhoneOrVideoHearing;
