const I = actor();
const config = require('../../../../../../config');

const fields ={
  firstName : 'input[id="firstName"]',
  lastName: 'input[id="lastName"]',
  email:'input[id="lastName"]',
  telephone: 'input[id="phoneNumber"]',
  jobTitle: 'input[id="jobTitle"]',
};

class ConfirmYourDetails {

  async enterYourDetails() {
    await I.waitForText('Confirm your details', config.WaitForText);
    await I.fillField(fields.firstName, 'Test');
    await I.fillField(fields.lastName, 'Test');
    await I.fillField(fields.email, 'test@test.com');
    await I.fillField(fields.telephone, '09797979797');
    await I.fillField(fields.jobTitle, 'Test');
    await I.click('Save and continue');
  }
}

module.exports = ConfirmYourDetails;