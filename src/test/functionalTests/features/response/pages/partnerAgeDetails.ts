import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="partnerAge"]',
  noButton: 'input[id="partnerAge-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class PartnerAgeDetails {

  clickYesButton(): void {
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton(): void {
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
