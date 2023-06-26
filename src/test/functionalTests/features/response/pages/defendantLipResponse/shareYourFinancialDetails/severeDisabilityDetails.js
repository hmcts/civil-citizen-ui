const I = actor();

const fields ={
  yesButton: '#option',
  noButton: '#option-2',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SevereDisabilityDetails {

  async clickYesButton() {
    await I.see('Are you severely disabled?', 'h1');
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }
  
  async clickNoButton() {
    await I.see('Are you severely disabled?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = SevereDisabilityDetails;