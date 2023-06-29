
const I = actor();

const fields ={
  employerName: 'input[id="rows[0][employerName]"]',
  jobTitle: 'input[id="rows[0][jobTitle]"]',
};
const buttons = {
  saveAndContinue: 'Save and continue',
};

class EmployerDetails {

  async enterEmployerDetails() {
    await I.see('Who employs you?', 'h1');
    await I.fillField(fields.employerName, 'ABC Ltd');
    await I.fillField(fields.jobTitle, 'Builder');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = EmployerDetails;