const I = actor();
const config = require('../../../../../../config');
const { sharedData } = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Do you live with a partner?',
    cy: 'Ydych chi\'n byw gyda phartner?',
  },
};

class PartnerDetails {

  async clickYesButton() {
    await I.waitForText(content.heading[sharedData.language], config.WaitForText);
    await I.click(fields.yesButton);
    await I.click(buttons.saveAndContinue);
  }

  async clickNoButton() {
    await I.waitForText(content.heading[sharedData.language], config.WaitForText);
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = PartnerDetails;
