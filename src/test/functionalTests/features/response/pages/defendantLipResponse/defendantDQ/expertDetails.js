const I = actor();
const config = require('../../../../../../config');

const fields ={
  firstName: 'input[id="items[0][firstName]"]',
  lastName: 'input[id="items[0][lastName]"]',
  emailAddress: 'input[id="items[0][emailAddress]"]',
  phoneNumber: 'input[id="items[0][phoneNumber]"]',
  fieldOfExpertise: 'input[id="items[0][fieldOfExpertise]"]',
  reason: 'textarea[id="items[0][whyNeedExpert]"]',
  estimatedCost: 'input[id="items[0][estimatedCost]"]',
};

class ExpertDetails {

  async EnterExpertDetails() {
    await I.waitForText('Enter the expert’s details', config.WaitForText);
    await I.fillField(fields.firstName, 'Test ExpertFName');
    await I.fillField(fields.lastName, 'Test ExpertLName');
    await I.fillField(fields.emailAddress, 'test@test.com');
    await I.fillField(fields.phoneNumber, '09898989898');
    await I.fillField(fields.fieldOfExpertise, 'Test');
    await I.fillField(fields.reason, 'Terst Reason');
    await I.fillField(fields.estimatedCost, '500');
    await I.click('Save and continue');
  }
}

module.exports = ExpertDetails;
