const I = actor();

const fields ={
  yesButton: 'input[id="partnerDisability"]',
  noButton: 'input[id="partnerDisability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerDisabilityDetails {

  clickYesButton() {
    I.see('Is your partner disabled?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Is your partner disabled?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}

module.exports = PartnerDisabilityDetails;