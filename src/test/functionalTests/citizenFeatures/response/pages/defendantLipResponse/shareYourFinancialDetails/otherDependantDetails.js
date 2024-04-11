const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  numberOfPeople: 'input[id="numberOfPeople"]',
  otherDetails: 'textarea[id="details"]',
};

const content = {
  heading: {
    en: 'Do you support anyone else financially?',
    cy: 'A ydych yn cefnogi rhywun arall yn ariannol?',
  },
};

const inputs = {
  details: {
    en: 'Parents',
    cy: 'Rhieni',
  },
};

class OtherDependantDetails {

  async clickYesButton() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.numberOfPeople, '2');
    await I.fillField(fields.otherDetails, inputs.details[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }

  async clickNoButton() {
    const { language } = sharedData; 
    await I.see(content.heading[language], 'h1');
    await I.click(fields.noButton);
    await I.click(cButtons.saveAndContinue);
  }
}

module.exports = OtherDependantDetails;
