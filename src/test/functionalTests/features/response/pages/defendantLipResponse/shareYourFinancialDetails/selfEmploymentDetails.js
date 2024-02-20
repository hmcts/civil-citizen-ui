const I = actor();
const config = require('../../../../../../config');

const fields ={
  jobTitle: 'input[id="jobTitle"]',
  annualTurnover: 'input[id="annualTurnover"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SelfEmploymentDetails {

  async enterSelfEmployerDetails() {
    await I.waitForText('What are you self-employed as?', config.WaitForText);
    await I.fillField(fields.jobTitle, 'Builder');
    await I.fillField(fields.annualTurnover, '40000');
    await I.click(buttons.continue);
  }
}

module.exports = SelfEmploymentDetails;
