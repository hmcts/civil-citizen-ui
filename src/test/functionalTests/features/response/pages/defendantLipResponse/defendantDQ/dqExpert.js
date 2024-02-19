const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  continueWithExpert: 'input[id="expertYes"]',
  continueWithoutExpert: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Using an expert',
    cy: 'Defnyddio arbenigwr',
  },
};

class DqExpert {

  async chooseExpert() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.continueWithExpert);
  }
}

module.exports = DqExpert;
