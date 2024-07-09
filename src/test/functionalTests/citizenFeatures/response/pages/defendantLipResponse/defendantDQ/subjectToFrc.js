const I = actor();
const config = require('../../../../../../config');
const cButtons = require('../../../../../commonComponents/cButtons');
const sharedData = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

const content = {
  heading: {
    en: 'Fixed Recoverable Costs Regime',
  },
  descriptionText: {
    en: 'Is the claim subject to the Fixed Recoverable Costs Regime?',
  },
};

class SubjectToFrc {

  async SelectSubjectToFrc() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.click('Save and continue');
    await I.see('Indicate if the claim is subject to the Fixed Recoverable Costs Regime');
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = SubjectToFrc;
