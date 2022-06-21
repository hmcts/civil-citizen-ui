import I = CodeceptJS.I

const I: I = actor();

const fields ={
  employerName: 'input[id="rows[0][employerName]"]',
  jobTitle: 'input[id="rows[0][jobTitle]"]',
};
const buttons = {
  saveAndContinue: 'Save and continue',
};

export class EmployerDetails {

  enterEmployerDetails(): void {
    I.see('Who employs you?', 'h1');
    I.fillField(fields.employerName, 'ABC Ltd');
    I.fillField(fields.jobTitle, 'Builder');
    I.click(buttons.saveAndContinue);
  }
}
