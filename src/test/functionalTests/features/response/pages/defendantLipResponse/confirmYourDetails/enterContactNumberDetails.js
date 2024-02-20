const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

const content = {
  headingCarm: {
    en: 'Enter a phone number',
    cy: 'Rhowch rif ffôn',
  },
  heading: {
    en: 'Enter a phone number (optional)',
    cy: 'Rhowch rif ffôn (dewisol)',
  },
};

class ContactNumberDetailsPage {
  async enterContactNumber(carmEnabled = false) {
    const language = sharedData.language;
    if (carmEnabled) { 
      await I.waitForText(content.headingCarm[language], config.WaitForText);
      // await I.click(content.saveAndContinueButton[language]);
      // await I.see('Enter telephone number');
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(buttons.saveAndContinue[language]);
    } else {
      await I.waitForText(content.heading[language], config.WaitForText);
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(buttons.saveAndContinue[language]);
    }
  }
}

module.exports = ContactNumberDetailsPage;
