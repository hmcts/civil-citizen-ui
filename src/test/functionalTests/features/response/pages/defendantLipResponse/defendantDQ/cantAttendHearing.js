const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

const content = {
  heading: {
    en: 'Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?',
    cy: 'A oes yna unrhyw ddyddiadau yn y 12 mis nesaf pan na allwch chi, eich arbenigwyr neu eich tystion fynychu gwrandawiad?',
  },
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};
class CantAttendHearing {

  async selectYesForCantAttendHearing() {
    await I.waitForText(content.heading[sharedData.language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.saveAndContinue[sharedData.language]);
  }
}

module.exports = CantAttendHearing;
