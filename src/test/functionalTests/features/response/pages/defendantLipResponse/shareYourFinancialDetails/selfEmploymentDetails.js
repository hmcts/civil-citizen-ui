const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  jobTitle: 'input[id="jobTitle"]',
  annualTurnover: 'input[id="annualTurnover"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'What are you self-employed as?',
    cy: 'Mewn pa fodd ydych chi’n hunangyflogedig?',
  },
};

const inputs = {
  jobTitle: {
    en: 'Builder',
    cy: 'Adeiladwr',
  },
};

class SelfEmploymentDetails {

  async enterSelfEmployerDetails() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.fillField(fields.jobTitle, inputs.jobTitle[language]);
    await I.fillField(fields.annualTurnover, '40000');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = SelfEmploymentDetails;
