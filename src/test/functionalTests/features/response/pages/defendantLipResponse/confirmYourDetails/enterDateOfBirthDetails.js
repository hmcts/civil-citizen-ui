
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
  enterDateOfBirth ()  {
    I.see('Enter your date of birth', 'h1');
    I.fillField(fields.day, '1');
    I.fillField(fields.month, '11');
    I.fillField(fields.year, '1987');
    I.click(buttons.saveAndContinue);
  }
}

module.exports = DateOfBirthDetailsPage;
