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
const currentDate = new Date();
const day = currentDate.getDay();
const month = currentDate.getMonth();
const year = currentDate.getFullYear() + 1;

export class DateToPayOn {
  enterDateToPayOn (): void {
    I.fillField(fields.day, day.toString());
    I.fillField(fields.month, month.toString());
    I.fillField(fields.year, year.toString());

    I.click(buttons.saveAndContinue);
  }
}
