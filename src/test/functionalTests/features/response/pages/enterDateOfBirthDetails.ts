import I = CodeceptJS.I

const I: I = actor();

const fields = {
  day: 'input[id="day"]',
  month: 'input[id="month"]',
  year: 'input[id="year"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

export class DateOfBirthDetailsPage {
  enterDateOfBirth (claimRef): void {
    I.amOnPage('/case/'+claimRef+'/response/your-dob');
    I.fillField(fields.day, '10');
    I.fillField(fields.month, '12');
    I.fillField(fields.year, '1990');

    I.click(buttons.saveAndContinue);
  }
}
