const I= actor();
const config = require('../../../../../../config');
const {language} = require('../../../../sharedData');

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const content = {
  heading: {
    en: 'Enter your date of birth',
    cy: 'Rhowch eich dyddiad geni'
  },
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  }
}

class DateOfBirthDetailsPage {
  async enterDateOfBirth (claimRef)  {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.fillField(fields.day, '11');
    await I.fillField(fields.month, '11');
    await I.fillField(fields.year, '1987');
    await I.click(content.saveAndContinue[language]);
  }
}

module.exports = DateOfBirthDetailsPage;
