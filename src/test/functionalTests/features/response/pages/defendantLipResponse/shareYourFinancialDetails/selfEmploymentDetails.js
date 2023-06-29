const I = actor();

const fields ={
  jobTitle: 'input[id="jobTitle"]',
  annualTurnover: 'input[id="annualTurnover"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SelfEmploymentDetails {

  async enterSelfEmployerDetails() {
    await I.see('What are you self-employed as?', 'h1');
    await I.fillField(fields.jobTitle, 'Builder');
    await I.fillField(fields.annualTurnover, '40000');
    await I.click(buttons.continue);
  }
}

module.exports = SelfEmploymentDetails;
