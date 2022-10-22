
const I= actor();

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const buttons = {
  saveAndContinue: 'div > form > button',
};

class DateOfBirthDetailsPage {
  enterDateOfBirth (claimRef)  {
    I.amOnPage('/case/' + claimRef + '/response/your-dob');
    I.see('Enter your date of birth', 'h1');
    I.fillField(fields.day, '10');
    I.fillField(fields.month, '12');
    I.fillField(fields.year, '1990');
    I.wait(5);
    I.click(buttons.saveAndContinue);
  }
}

module.exports = DateOfBirthDetailsPage;