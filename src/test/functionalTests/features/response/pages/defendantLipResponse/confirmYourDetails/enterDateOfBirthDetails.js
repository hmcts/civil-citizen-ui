
const I= actor();

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const buttons = {
  saveAndContinue: 'Save and continue',
};

class DateOfBirthDetailsPage {
  async enterDateOfBirth ()  {
    await I.see('Enter your date of birth', 'h1');
    await I.fillField(fields.day, '1');
    await I.fillField(fields.month, '11');
    await I.fillField(fields.year, '1987');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = DateOfBirthDetailsPage;
