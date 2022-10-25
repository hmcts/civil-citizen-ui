
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
  enterDateOfBirth ()  {   
    I.see('Enter your date of birth', 'h1');
    I.fillField(fields.day, '1');
    I.fillField(fields.month, '11');
    I.fillField(fields.year, '1987');    
    I.click(buttons.saveAndContinue);
  }

  navigateToEnterDateOfBirthDetailsPage(claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/your-dob');
  }
}

module.exports = DateOfBirthDetailsPage;