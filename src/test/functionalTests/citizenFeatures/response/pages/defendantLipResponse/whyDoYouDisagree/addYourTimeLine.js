const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  date1Day: 'input[name="rows[0][day]"]',
  date1Month: 'input[name="rows[0][month]"]',
  date1Year: 'input[name="rows[0][year]"]',
  description1: '[id="rows[0][description]"]',
};

// const buttons = {
//   addAnotherAccount: 'Add another account',
// };

const content = {
  heading: {
    en: 'Add your timeline of events',
    cy: 'Ychwanegu eich amserlen digwyddiadau',
  },
};

const inputs = {
  description1: {
    en: 'TestTimeLine',
    cy: 'Amserlen Prawf',
  },
};

class AddYourTimeLine {
  async addTimeLineOfEvents() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.fillField(fields.date1Day, 12);
    await I.fillField(fields.date1Month, 12);
    await I.fillField(fields.date1Year, 2023);
    await I.fillField(fields.description1, inputs.description1[language]);
    this.clickContinue();
  }

  async clickContinue(){
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = AddYourTimeLine;
