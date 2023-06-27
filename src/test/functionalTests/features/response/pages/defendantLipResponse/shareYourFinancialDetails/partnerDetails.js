const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerDetails {

  async clickYesButton() {
    await I.see('Do you live with a partner?', 'h1');
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.see('Do you live with a partner?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = PartnerDetails;
