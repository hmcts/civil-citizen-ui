import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  amountYouOwe: 'input[id="amountYouOwe"]',
  reason: 'textarea[id="reason"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class SelfEmploymentTaxDetails {

  clickYesButton(): void {
    I.click(fields.yesButton);
    I.fillField(fields.amountYouOwe, '2000');
    I.fillField(fields.reason, 'Last year pending');
    I.click(buttons.continue);
  }
  clickNoButton(): void {
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
