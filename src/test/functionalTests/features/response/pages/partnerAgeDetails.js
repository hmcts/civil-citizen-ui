const I = actor();

const fields ={
  yesButton: 'input[id="partnerAge"]',
  noButton: 'input[id="partnerAge-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class PartnerAgeDetails {

  clickYesButton() {
    I.see('Is your partner aged 18 or over?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Is your partner aged 18 or over?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
