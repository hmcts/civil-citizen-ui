const I = actor();
const config = require('../../../../../../config');
const {language} = require('../../../../../sharedData');

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

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

class HearingRequirements {

  async selectHearingRequirements(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/directions-questionnaire/determination-without-hearing');
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(content.heading[language]);
  }
}

module.exports = HearingRequirements;
