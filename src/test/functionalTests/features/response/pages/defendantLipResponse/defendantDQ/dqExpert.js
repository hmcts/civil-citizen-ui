
const I = actor();

const fields ={
  continueWithExpert: 'input[id="expertYes"]',
  continueWithoutExpert: 'button.govuk-button',
};

class DqExpert {

  chooseExpert(claimRef) {
    I.see('Using an expert', 'h1');
    I.click(fields.continueWithExpert);
  }
}

module.exports = DqExpert;
