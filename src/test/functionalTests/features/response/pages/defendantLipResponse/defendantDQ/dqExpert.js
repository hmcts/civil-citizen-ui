
const I = actor();

const fields ={
  continueWithExpert: 'input[id="expertYes"]',
  continueWithoutExpert: 'button.govuk-button',
};

class DqExpert {

  async chooseExpert() {
    await I.see('Using an expert', 'h1');
    await I.click(fields.continueWithExpert);
  }
}

module.exports = DqExpert;
