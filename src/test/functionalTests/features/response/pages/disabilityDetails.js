
const I = actor();

const fields ={
  yesButton: 'input[id="disability"]',
  noButton: 'input[id="disability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class DisabilityDetails {

  clickYesButton() {
    I.see('Are you disabled?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Are you disabled?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
