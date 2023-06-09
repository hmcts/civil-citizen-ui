const I = actor();

const fields = {
  date1Day: '[id="day"]',
  date1Month: '[id="month"]',
  date1Year: '[id="year"]',
  whathappened1: '[id="rows[0][description]"]',
};

const buttons = {
  addAnotherAccount: 'Add another account',
  saveAndContinue: 'Save and continue',
};

const newDate = new Date(new Date().setMonth(new Date().getMonth()));
const extendedDay = newDate.getDay();
const extendedMonth = newDate.getMonth();
const extendedYear = newDate.getFullYear();

class AddYourTimeLine {
  addTimeLineOfEvents() {
    I.see('Add your timeline of events', 'h1');
    I.fillField(fields.date1Day, extendedDay);
    I.fillField(fields.date1Month, extendedMonth - 3);
    I.fillField(fields.date1Year, extendedYear);
    I.fillField(fields.whathappened1, 'TestTimeLine');
    this.clickContinue();
  }

  clickContinue(){
    I.click(buttons.saveAndContinue);
  }
}

module.exports = AddYourTimeLine;
