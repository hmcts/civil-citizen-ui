const I = actor();
const config = require('../../../../../../config');
const cButtons = require('../../../../../commonComponents/cButtons');
const sharedData = require('../../../../../sharedData');

const fields ={
  band1: 'input[id="complexityBand"]',
  band2: 'input[id="complexityBand-2"]',
};

const content = {
  heading: {
    en: 'Complexity band',
  },
  descriptionText: {
    en: 'Which complexity band do you believe this claim falls into?',
  },
};

class AssignComplexityBand {

  async SelectComplexityBand() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.click('Save and continue');
    await I.see('Indicate which complexity band you believe this claim falls into');
    await I.click(fields.band2);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = AssignComplexityBand;
