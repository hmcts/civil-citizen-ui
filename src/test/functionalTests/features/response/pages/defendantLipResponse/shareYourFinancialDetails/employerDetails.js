const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields ={
  employerName: 'input[id="rows[0][employerName]"]',
  jobTitle: 'input[id="rows[0][jobTitle]"]',
};
const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  },
};

const content = {
  heading: {
    en: 'Who employs you?',
    cy: 'Pwy sy’n eich cyflogi'
  }
}

const inputs = {
  jobTitle: {
    en: 'Builder',
    cy: 'Adeiladwr'
  }
}

class EmployerDetails {

  async enterEmployerDetails() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.fillField(fields.employerName, 'ABC Ltd');
    await I.fillField(fields.jobTitle, inputs.jobTitle[language]);
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = EmployerDetails;
