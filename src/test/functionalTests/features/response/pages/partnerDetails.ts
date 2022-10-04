import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class PartnerDetails {

  clickYesButton(): void {
    I.see('Do you live with a partner?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton(): void {
    I.see('Do you live with a partner?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
