import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  under11: 'input[id="under11"]',
  between11and15: 'input[id="between11and15"]',
  between16and19: 'input[id="between16and19"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class DependantDetails {

  clickYesButton(): void {
    I.see('Do any children live with you?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.under11, '1');
    I.fillField(fields.between11and15, '1');
    I.fillField(fields.between16and19, '0');
    I.click(buttons.continue);
  }
  clickNoButton(): void {
    I.see('Do any children live with you?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
