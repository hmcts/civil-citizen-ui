import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="partnerPension"]',
  noButton: 'input[id="partnerPension-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class PartnerPensionDetails {

  clickYesButton(): void {
    I.see('Does your partner receive a pension?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton(): void {
    I.see('Does your partner receive a pension?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
