const I = actor();
const config = require('../../../../../../config');

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class ContactNumberDetailsPage {
  async enterContactNumber(carmEnabled = false) {
    if (carmEnabled) {
      await I.waitForText('Enter a phone number', config.WaitForText);
      await I.click('Save and continue');
      await I.see('Enter telephone number');
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click('Save and continue');
    } else {
      await I.waitForText('Enter a phone number (optional)', config.WaitForText);
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(buttons.saveAndContinue);
    }
  }

  async enterContactNumberWelsh(carmEnabled = false) {
    if (carmEnabled) {
      await I.waitForText('Enter a phone number', config.WaitForText);
      await I.click('Save and continue');
      await I.see('Enter telephone number');
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click('Save and continue');
    } else {
      await I.waitForText('Rhowch rif ffôn (dewisol)', config.WaitForText);
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(buttons.saveAndContinue);
    }
  }
}

module.exports = ContactNumberDetailsPage;
