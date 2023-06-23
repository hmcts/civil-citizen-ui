
const I = actor();

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

class DateToPayOn {
  async enterDateToPayOn () {
    await I.see('What date will you pay on?', 'h1');
    await I.fillField(fields.day, day.toString());
    await I.fillField(fields.month, month.toString());
    await I.fillField(fields.year, year.toString());
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = DateToPayOn;