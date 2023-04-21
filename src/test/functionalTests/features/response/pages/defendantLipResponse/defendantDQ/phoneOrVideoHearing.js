
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  details: 'textarea[id="details"]',
};

class PhoneOrVideoHearing {

  selectOptionForPhoneOrVideoHearing(claimRef) {
    I.see('Do you want to ask for a telephone or video hearing?', 'h1');
    I.see('The judge will decide if the hearing can be held by telephone or video.');
    I.click(fields.yesButton);
    I.fillField(fields.details, 'Test details');
    I.click('Save and continue');
  }
}

module.exports = PhoneOrVideoHearing;
