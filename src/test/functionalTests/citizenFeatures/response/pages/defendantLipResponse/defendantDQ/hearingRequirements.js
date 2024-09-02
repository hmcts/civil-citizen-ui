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
    en: 'Determination without Hearing Questions',
    cy: 'Cwestiynau Penderfynu heb Wrandawiad',
  },
};

class HearingRequirements {

  async selectHearingRequirements(claimRef) {
    const { language } = sharedData;
    await I.amOnPage('/case/'+claimRef+'/directions-questionnaire/determination-without-hearing');
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = HearingRequirements;
