const I = actor();
const config = require('../../../../../../config');

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};
const currentDate = new Date();
const day = currentDate.getDay();
const month = currentDate.getMonth();
const year = currentDate.getFullYear() + 1;
const dayError = currentDate.getDay() + 1000;
const monthError = currentDate.getMonth() - 1000;

class DateToPayOn {
  async enterDateToPayOn () {
    await I.waitForText('What date will you pay on?', config.WaitForText);
    await I.fillField(fields.day, day.toString());
    await I.fillField(fields.month, month.toString());
    await I.fillField(fields.year, year.toString());
    await I.click(buttons.saveAndContinue);
  }

  async enterDateToPayOnError () {
    await I.waitForText('What date will you pay on?', config.WaitForText);
    await I.click(buttons.saveAndContinue);
    //empty fields
    await I.see('There was a problem');
    await I.see('Enter a valid day');
    await I.see('Enter a valid month');
    await I.see('Enter a valid year');
    //invalid date, month & year
    await I.fillField(fields.day, dayError.toString());
    await I.fillField(fields.month, monthError.toString());
    await I.fillField(fields.year, '20');
    await I.click(buttons.saveAndContinue);
    await I.see('There was a problem');
    await I.see('Enter a valid day');
    await I.see('Enter a valid month');
    await I.see('Enter a 4 digit year');
  }
}

module.exports = DateToPayOn;
