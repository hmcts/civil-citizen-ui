const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

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
    await I.waitForContent(content.heading[sharedData.language], config.WaitForText);
    await I.click(fields.continueWithExpert);
  }
}

module.exports = DqExpert;
