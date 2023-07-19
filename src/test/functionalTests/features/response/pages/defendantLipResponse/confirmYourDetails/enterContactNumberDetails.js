const I = actor();
const config = require('../../../../../../config');

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class ContactNumberDetailsPage {
  async enterContactNumber () {
    await I.waitForText('Enter a phone number (optional)', config.WaitForText);
    await I.fillField(fields.contactNumber, '02088908876');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = ContactNumberDetailsPage;
