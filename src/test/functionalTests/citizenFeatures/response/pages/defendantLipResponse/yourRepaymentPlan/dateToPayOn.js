const I = actor();
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
    en: 'What date will you pay on?',
    cy: 'Ar ba ddyddiad byddwch yn talu',
  },
};

const currentDate = new Date();
const day = 1;
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear() + 1;
const dayError = currentDate.getDay() + 1000;
const monthError = currentDate.getMonth() - 1000;

class DateToPayOn {
  async enterDateToPayOn () {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.day, day.toString());
    await I.fillField(fields.month, month.toString());
    await I.fillField(fields.year, year.toString());
    await I.click(cButtons.saveAndContinue[language]);
  }

  async enterDateToPayOnError () {
    const { language } = sharedData;
    await I.waitForContent('What date will you pay on?', config.WaitForText);
    await I.click(cButtons.saveAndContinue[language]);
    //empty fields
    await I.see('There was a problem');
    await I.see('Enter a valid day');
    await I.see('Enter a valid month');
    await I.see('Enter a valid year');
    //invalid date, month & year
    await I.fillField(fields.day, dayError.toString());
    await I.fillField(fields.month, monthError.toString());
    await I.fillField(fields.year, '20');
    await I.click(cButtons.saveAndContinue[language]);
    await I.see('There was a problem');
    await I.see('Enter a valid day');
    await I.see('Enter a valid month');
    await I.see('Enter a 4 digit year');
  }
}

module.exports = DateToPayOn;
