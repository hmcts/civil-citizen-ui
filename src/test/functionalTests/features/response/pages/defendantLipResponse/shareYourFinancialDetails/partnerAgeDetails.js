const I = actor();

const fields ={
  yesButton: 'input[id="partnerAge"]',
  noButton: 'input[id="partnerAge-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartnerAgeDetails {

  async clickYesButton() {
    await I.see('Is your partner aged 18 or over?', 'h1');
    await I.click(fields.yesButton);
    await I.click(buttons.continue);
  }

  async clickNoButton() {
    await I.see('Is your partner aged 18 or over?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}
module.exports = PartnerAgeDetails;
