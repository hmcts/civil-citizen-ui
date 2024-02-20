const I = actor();
const config = require('../../../../../../config');

const fields ={
  continueWithExpert: 'input[id="expertYes"]',
  continueWithoutExpert: 'button.govuk-button',
};

class DqExpert {

  async chooseExpert() {
    await I.waitForText('Using an expert', config.WaitForText);
    await I.click(fields.continueWithExpert);
  }
}

module.exports = DqExpert;
