const I = actor();
const config = require('../../../../../../config');

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

const newDate = new Date();
const extendedDay = newDate.getDay();
const extendedMonth = newDate.getMonth();
const extendedYear = newDate.getFullYear();

class AddYourTimeLine {
  async addTimeLineOfEvents() {
    await I.waitForText('Add your timeline of events', config.WaitForText);
    await I.fillField(fields.date1Day, extendedDay);
    await I.fillField(fields.date1Month, extendedMonth - 3);
    await I.fillField(fields.date1Year, extendedYear);
    await I.fillField(fields.whathappened1, 'TestTimeLine');
    this.clickContinue();
  }

  async clickContinue(){
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = AddYourTimeLine;
