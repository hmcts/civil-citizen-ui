const I = actor();
const config = require('../../../../../../config');

const fields = {
  contactPerson: 'input[id="contactPerson"]',
  addressLine1: 'input[id="primaryAddress[addressLine1]"]',
  addressLine2: 'input[id="primaryAddress[addressLine2]"]',
  addressLine3: 'input[id="primaryAddress[addressLine3]"]',
  city: 'input[id="primaryAddress[city]"]',
  postcode: 'input[id="primaryAddress[postCode]"]',
  correspondenceAddress_yes: 'input[id="postToThisAddress-2"]',
  enterAddressManuallyLink: 'a[id="enterAddressManually"]',
  correspondenceAddressLine1: 'input[id="correspondenceAddress[addressLine1]"]',
  correspondenceAddressLine2: 'input[id="correspondenceAddress[addressLine2]"]',
  correspondenceAddressLine3: 'input[id="correspondenceAddress[addressLine3]"]',
  correspondenceCity: 'input[id="correspondenceAddress[city]"]',
  correspondencePostCode: 'input[id="correspondenceAddress[postCode]"]',
};

class EnterCompanyDetails {
  async enterCompanyDetails () {
    await I.click('Confirm your details');
    await I.waitForElement(fields.contactPerson, config.WaitForText);
    await I.fillField(fields.contactPerson, 'TestPerson');
    await I.fillField(fields.addressLine1, 'Test AddressLine1');
    await I.fillField(fields.addressLine2, 'Test AddressLine2');
    await I.fillField(fields.addressLine3, 'Test AddressLine3');
    await I.fillField(fields.city, 'Test City');
    await I.fillField(fields.postcode, 'IG6 1JD');
  }

  async enterCorrespondenceAddressManually () {
    await I.click(fields.correspondenceAddress_yes);
    await I.click('Enter address manually');
    await I.fillField(fields.correspondenceAddressLine1, 'Flat 10');
    await I.fillField(fields.correspondenceAddressLine2, '823 Knighton Court');
    await I.fillField(fields.correspondenceAddressLine3, 'Cranbrook Road');
    await I.fillField(fields.correspondenceCity, 'Barkingside');
    await I.fillField(fields.correspondencePostCode, 'IG2 6QU');
    await I.click('Save and continue');
  }
}

module.exports = EnterCompanyDetails;
