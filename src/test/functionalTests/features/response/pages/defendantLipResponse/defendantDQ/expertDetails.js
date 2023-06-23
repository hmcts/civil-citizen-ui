
const I = actor();

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

  EnterExpertDetails() {
    I.see('Enter the expert’s details', 'h1');
    I.fillField(fields.firstName, 'Test ExpertFName');
    I.fillField(fields.lastName, 'Test ExpertLName');
    I.fillField(fields.emailAddress, 'test@test.com');
    I.fillField(fields.phoneNumber, '09898989898');
    I.fillField(fields.fieldOfExpertise, 'Test');
    I.fillField(fields.reason, 'Terst Reason');
    I.fillField(fields.estimatedCost, '500');
    I.click('Save and continue');
  }
}

module.exports = ExpertDetails;
