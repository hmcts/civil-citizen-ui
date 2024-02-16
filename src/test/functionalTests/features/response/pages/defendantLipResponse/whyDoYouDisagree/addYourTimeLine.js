const I = actor();
const config = require('../../../../../../config');
const { language } = require('../../../../../sharedData');

const fields = {
  date1Day: '[id="day"]',
  date1Month: '[id="month"]',
  date1Year: '[id="year"]',
  description1: '[id="rows[0][description]"]',
};

const buttons = {
  addAnotherAccount: 'Add another account',
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  },
};

const content = {
  heading: {
    en: 'Add your timeline of events',
    cy: 'Ychwanegu eich amserlen digwyddiadau'
  }
}

const inputs = {
  description1: {
    en: 'TestTimeLine',
    cy: 'Amserlen Prawf'
  }
}

class AddYourTimeLine {
  async addTimeLineOfEvents() {
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.fillField(fields.date1Day, 12);
    await I.fillField(fields.date1Month, 12);
    await I.fillField(fields.date1Year, 2023);
    await I.fillField(fields.description1, inputs.description1[language]);
    this.clickContinue();
  }

  async clickContinue(){
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = AddYourTimeLine;
