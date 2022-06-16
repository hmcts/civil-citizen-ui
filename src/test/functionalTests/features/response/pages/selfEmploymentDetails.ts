import I = CodeceptJS.I

const I: I = actor();

const fields ={
  jobTitle: 'input[id="jobTitle"]',
  annualTurnover: 'input[id="annualTurnover"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class SelfEmploymentDetails {

  enterSelfEmployerDetails(): void {
    I.fillField(fields.jobTitle, 'Builder');
    I.fillField(fields.annualTurnover, '40000');
    I.click(buttons.continue);
  }
}
