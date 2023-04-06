const I = actor();

const fields ={
  yesButton: 'input[id="partnerPension"]',
  noButton: 'input[id="partnerPension-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerPensionDetails {

  clickYesButton() {
    I.see('Does your partner receive a pension?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Does your partner receive a pension?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}

module.exports = PartnerPensionDetails;
