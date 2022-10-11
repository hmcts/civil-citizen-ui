const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class CarerDetails {

  clickYesButton() {
    I.see('Do you claim Carer’s Allowance or Carer’s Credit?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Do you claim Carer’s Allowance or Carer’s Credit?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
