const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  employerName: 'input[id="rows[0][employerName]"]',
  jobTitle: 'input[id="rows[0][jobTitle]"]',
};

const content = {
  heading: {
    en: 'Who employs you?',
    cy: 'Pwy sy’n eich cyflogi',
  },
};

const inputs = {
  jobTitle: {
    en: 'Builder',
    cy: 'Adeiladwr',
  },
};

class EmployerDetails {

  async enterEmployerDetails() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.employerName, 'ABC Ltd');
    await I.fillField(fields.jobTitle, inputs.jobTitle[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = EmployerDetails;
