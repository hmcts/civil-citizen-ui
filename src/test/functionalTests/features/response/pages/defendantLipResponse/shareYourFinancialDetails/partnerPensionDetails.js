const I = actor();

const fields ={
  yesButton: 'input[id="partnerPension"]',
  noButton: 'input[id="partnerPension-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerPensionDetails {

  async clickYesButton() {
    await I.see('Does your partner receive a pension?', 'h1');
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }
  
  async clickNoButton() {
    await I.see('Does your partner receive a pension?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = PartnerPensionDetails;
