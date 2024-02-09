const I= actor();
const config = require('../../../../../../config');

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const pageContent = {
  dateOfBirthDeatilsHeading: {
    en: 'Enter your date of birth',
    cy: 'Rhowch eich dyddiad geni'
  },
  saveAndContinueButtonText: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau' 
  }
};

class DateOfBirthDetailsPage {
  async enterDateOfBirth (claimRef, language = 'en')  {
    await I.waitForText(pageContent.dateOfBirthDeatilsHeading[language], config.WaitForText);
    await I.fillField(fields.day, '11');
    await I.fillField(fields.month, '11');
    await I.fillField(fields.year, '1987');
    await I.click(pageContent.saveAndContinueButtonText[language]);
  }
}

module.exports = DateOfBirthDetailsPage;
