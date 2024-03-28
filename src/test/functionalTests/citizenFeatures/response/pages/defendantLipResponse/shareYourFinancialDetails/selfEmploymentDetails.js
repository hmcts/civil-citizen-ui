const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  jobTitle: 'input[id="jobTitle"]',
  annualTurnover: 'input[id="annualTurnover"]',
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
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.jobTitle, inputs.jobTitle[language]);
    await I.fillField(fields.annualTurnover, '40000');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = SelfEmploymentDetails;
