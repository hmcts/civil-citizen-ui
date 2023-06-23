
const I = actor();

const fields ={
  yesButton: 'input[id="disability"]',
  noButton: 'input[id="disability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class DisabilityDetails {

  async clickYesButton() {
    await I.see('Are you disabled?', 'h1');
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }
  
  async clickNoButton() {
    await I.see('Are you disabled?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = DisabilityDetails;