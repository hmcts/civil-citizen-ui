
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class CantAttendHearing {

  selectYesForCantAttendHearing(claimRef) {
    I.see('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', 'h1');
    I.click(fields.yesButton);
    I.click('Save and continue');
  }
}

module.exports = CantAttendHearing;
