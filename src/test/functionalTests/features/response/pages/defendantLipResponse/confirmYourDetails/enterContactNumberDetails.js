
const I = actor();

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'Save and continue',
};

class ContactNumberDetailsPage {
  async enterContactNumber () {
    await I.see('Enter a phone number (optional)', 'h1');
    await I.fillField(fields.contactNumber, '02088908876');
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = ContactNumberDetailsPage;
