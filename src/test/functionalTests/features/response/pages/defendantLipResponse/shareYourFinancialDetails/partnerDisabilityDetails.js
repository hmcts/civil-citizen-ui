const I = actor();

const fields ={
  yesButton: 'input[id="partnerDisability"]',
  noButton: 'input[id="partnerDisability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerDisabilityDetails {

  async clickYesButton() {
    await I.see('Is your partner disabled?', 'h1');
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }
  
  async clickNoButton() {
    await I.see('Is your partner disabled?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = PartnerDisabilityDetails;