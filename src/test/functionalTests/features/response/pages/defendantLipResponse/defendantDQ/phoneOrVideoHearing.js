
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  details: 'textarea[id="details"]',
};

class PhoneOrVideoHearing {

  selectOptionForPhoneOrVideoHearing(option = 'Yes') {
    I.see('Do you want to ask for a telephone or video hearing?', 'h1');
    I.see('The judge will decide if the hearing can be held by telephone or video.');
    switch (option) {
      case 'Yes': {
        I.click(fields.yesButton);
        I.fillField(fields.details, 'Test details');
        break;
      }
      case 'No': {
        I.click(fields.noButton);
        break;
      }
      default:
        I.click(fields.yesButton);
    }
    I.click('Save and continue');
  }
}

module.exports = PhoneOrVideoHearing;
