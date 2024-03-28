const I= actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const content = {
  heading: {
    en: 'Enter your date of birth',
    cy: 'Rhowch eich dyddiad geni',
  },
};

class DateOfBirthDetailsPage {
  async enterDateOfBirth ()  {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.day, '11');
    await I.fillField(fields.month, '11');
    await I.fillField(fields.year, '1987');
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = DateOfBirthDetailsPage;
