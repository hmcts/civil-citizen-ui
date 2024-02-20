const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="partnerPension"]',
  noButton: 'input[id="partnerPension-2"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Does your partner receive a pension?',
    cy: 'A yw eich partner yn cael pensiwn?',
  },
};

class PartnerPensionDetails {

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

module.exports = PartnerPensionDetails;
