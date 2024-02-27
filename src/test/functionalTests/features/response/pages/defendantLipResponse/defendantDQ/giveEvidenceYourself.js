const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

const content = {
  heading: {
    en: 'Do you want to give evidence yourself?',
    cy: 'A ydych eisiau rhoi tystiolaeth eich hun?',
  },
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

class GiveEvidenceYourself {

  async selectGiveEvidenceYourself() {
    await I.waitForText(content.heading[sharedData.language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.saveAndContinue[sharedData.language]);
  }
}

module.exports = GiveEvidenceYourself;
