
const I = actor();

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  under11: 'input[id="under11"]',
  between11and15: 'input[id="between11and15"]',
  between16and19: 'input[id="between16and19"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class DependantDetails {

  async clickYesButton() {
    await I.see('Do any children live with you?', 'h1');
    await I.click(fields.yesButton);
    await I.fillField(fields.under11, '1');
    await I.fillField(fields.between11and15, '1');
    await I.fillField(fields.between16and19, '0');
    await I.click(buttons.continue);
  }
  
  async clickNoButton() {
    await I.see('Do any children live with you?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = DependantDetails;