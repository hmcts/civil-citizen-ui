const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

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
class CantAttendHearing {

  async selectYesForCantAttendHearing() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = CantAttendHearing;
