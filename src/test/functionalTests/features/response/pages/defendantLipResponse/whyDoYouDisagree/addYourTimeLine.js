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

class AddYourTimeLine {
  async addTimeLineOfEvents() {
    await I.waitForText('Add your timeline of events', config.WaitForText);
    await I.fillField(fields.date1Day, 12);
    await I.fillField(fields.date1Month, 12);
    await I.fillField(fields.date1Year, 2023);
    await I.fillField(fields.whathappened1, 'TestTimeLine');
    this.clickContinue();
  }

  async clickContinue(){
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = AddYourTimeLine;
