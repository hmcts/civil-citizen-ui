const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  under11: 'input[id="under11"]',
  between11and15: 'input[id="between11and15"]',
  between16and19: 'input[id="between16and19"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Do any children live with you?',
    cy: 'A oes unrhyw blant yn byw gyda chi?'
  }
}

class DependantDetails {

  async clickYesButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.fillField(fields.under11, '1');
    await I.fillField(fields.between11and15, '1');
    await I.fillField(fields.between16and19, '0');
    await I.click(buttons.saveAndContinue);
  }

  async clickNoButton() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = DependantDetails;
