const I= actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: '#main-content button.govuk-button',
};
const content = {
  heading: {
    en: 'Have you paid the claimant the amount you admit you owe?',
    cy: 'A ydych wedi talu’r hawlydd y swm rydych chi’n cyfaddef sy’n ddyledus gennych?',
  },
};

class PartAdmitAlreadyPaid {
  async selectAlreadyPaid(option) {
    await I.waitForContent(content.heading[sharedData.language], config.WaitForText);
    if(option == 'yes'){
      await I.click(fields.yesButton);
    }else{
      await I.click(fields.noButton);
    }
    await I.click(buttons.continue);
  }
}

module.exports = PartAdmitAlreadyPaid;
