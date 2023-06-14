
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class CantAttendHearing {

  selectYesForCantAttendHearing(option = 'Yes') {
    I.see('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', 'h1');
    switch (option) {
      case 'Yes': {
        I.click(fields.yesButton);
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

module.exports = CantAttendHearing;
