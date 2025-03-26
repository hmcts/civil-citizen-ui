const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
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
  async enterContactNumber(carmEnabled = true) {
    const { language } = sharedData;
    if (carmEnabled) { 
      await I.waitForContent(content.headingCarm[language], config.WaitForText);
      // await I.click(content.saveAndContinueButton[language]);
      // await I.see('Enter telephone number');
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(cButtons.saveAndContinue[language]);
    } else {
      await I.waitForContent(content.heading[language], config.WaitForText);
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(cButtons.saveAndContinue[language]);
    }
  }
}

module.exports = ContactNumberDetailsPage;
