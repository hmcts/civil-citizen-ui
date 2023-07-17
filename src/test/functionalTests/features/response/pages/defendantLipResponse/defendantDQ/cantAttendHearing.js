const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class CantAttendHearing {

  async selectYesForCantAttendHearing() {
    await I.waitForText('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?', config.WaitForText);
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = CantAttendHearing;
