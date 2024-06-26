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
    en: 'Do you want to give evidence yourself?',
    cy: 'A ydych eisiau rhoi tystiolaeth eich hun?',
  },
};

class GiveEvidenceYourself {

  async selectGiveEvidenceYourself() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = GiveEvidenceYourself;
