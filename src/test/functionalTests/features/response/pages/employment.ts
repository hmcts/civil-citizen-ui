import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  employment: 'Employed',
  selfEmployment: 'Self-employed',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class EmploymentDetails {

  clickYesButton(): void {
    I.see('Do you have a job?', 'h1');
    I.click(fields.yesButton);
    I.checkOption(fields.employment);
    I.checkOption(fields.selfEmployment);
    I.click(buttons.continue);
  }
  clickNoButton(): void {
    I.see('Do you have a job?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}
