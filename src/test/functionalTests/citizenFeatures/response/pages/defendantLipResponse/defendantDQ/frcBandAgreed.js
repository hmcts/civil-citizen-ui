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
    en: 'Agreement of complexity band',
  },
  descriptionText: {
    en: 'Has the complexity band been agreed with the other parties?',
  },
};

class FrcBandAgreed {

  async SelectFrcBandAgreed() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.click('Save and continue');
    await I.see('Indicate if the complexity band has been agreed with the other parties');
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = FrcBandAgreed;
