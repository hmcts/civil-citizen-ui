
const I = actor();

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'Save and continue',
};

class ContactNumberDetailsPage {
  enterContactNumber (claimRef, contactNumber = '02088908876') {
    I.see('Enter a phone number (optional)', 'h1');
    I.fillField(fields.contactNumber, contactNumber);
    I.click(buttons.saveAndContinue);
  }
}

module.exports = ContactNumberDetailsPage;
