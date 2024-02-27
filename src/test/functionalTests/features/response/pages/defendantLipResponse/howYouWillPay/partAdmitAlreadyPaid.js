const I= actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: '#main-content button.govuk-button',
};

class PartAdmitAlreadyPaid {

  async selectAlreadyPaid(option) {
    await I.waitForText('Have you paid the claimant the amount you admit you owe?', config.WaitForText);
    if(option == 'yes'){
      await I.click(fields.yesButton);
    }else{
      await I.click(fields.noButton);
    }
    await I.click(buttons.continue);
  }
}

module.exports = PartAdmitAlreadyPaid;
