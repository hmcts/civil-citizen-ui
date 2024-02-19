const I = actor();
const config = require('../../../../../../config');
const { sharedData } = require('../../../../../sharedData');

const fields ={
  firstName : 'input[id="firstName"]',
  lastName: 'input[id="lastName"]',
  email:'input[id="lastName"]',
  telephone: 'input[id="phoneNumber"]',
  jobTitle: 'input[id="jobTitle"]',
};

const content = {
  heading: {
    en: 'Confirm your details',
    cy: 'Cadarnhewch eich manylion',
  },
  descriptionText: {
    en: 'Give details of the person that will be giving evidence.',
    cy: 'Rhowch fanylion yr unigolyn a fydd yn rhoi tystiolaeth.',
  },
};

const inputs = {
  jobTitle: {
    en: 'Test',
    cy: 'Prawf',
  },
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

class ConfirmYourDetails {

  async enterYourDetails() {
    const { language } = sharedData; 
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.fillField(fields.firstName, 'John');
    await I.fillField(fields.lastName, 'Doe');
    await I.fillField(fields.email, 'test@test.com');
    await I.fillField(fields.telephone, '09797979797');
    await I.fillField(fields.jobTitle, inputs.jobTitle[language]);
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = ConfirmYourDetails;