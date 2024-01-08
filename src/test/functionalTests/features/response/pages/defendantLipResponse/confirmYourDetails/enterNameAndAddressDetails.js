const I = actor();
const config = require('../../../../../../config');

const fields = {
  addressLine1: 'input[id="primaryAddress[addressLine1]"]',
  addressLine1_error: 'a[href="#primaryAddress[addressLine1]"]',
  addressLine2: 'input[id="primaryAddress[addressLine2]"]',
  addressLine3: 'input[id="primaryAddress[addressLine3]"]',
  city: 'input[id="primaryAddress[city]"]',
  city_error: 'a[href="#primaryAddress[city]"]',
  postcode: 'input[id="primaryAddress[postCode]"]',
  postcode_error: 'a[href="#primaryAddress[postCode]"]',
  correspondenceAddress_yes: 'input[id="postToThisAddress-2"]',
  correspondenceAddress_no: 'input[id="postToThisAddress"]',
  enterAddressManuallyLink: 'a[id="enterAddressManually"]',
  correspondenceAddressLine1: 'input[id="correspondenceAddress[addressLine1]"]',
  correspondenceAddressLine1_error: 'a[href="#correspondenceAddress[addressLine1]"]',
  correspondenceAddressLine2: 'input[id="correspondenceAddress[addressLine2]"]',
  correspondenceAddressLine3: 'input[id="correspondenceAddress[addressLine3]"]',
  correspondenceCity: 'input[id="correspondenceAddress[city]"]',
  correspondenceCity_error: 'a[href="#correspondenceAddress[city]"]',
  correspondencePostCode: 'input[id="correspondenceAddress[postCode]"]',
  correspondencePostCode_error: 'a[href="#correspondenceAddress[postCode]"]',
  personError: 'a[href="#contactPerson"]',
  contactPerson: 'input[id="contactPerson"]',
};

class NameAndAddressDetailsPage {
  async enterNameAndAddressDetails () {
    await I.click('Confirm your details');
    await I.waitForElement(fields.addressLine1, config.WaitForText);
    await I.fillField(fields.addressLine1, 'Test AddressLine1');
    await I.fillField(fields.addressLine2, 'Test AddressLine2');
    await I.fillField(fields.addressLine3, 'Test AddressLine3');
    await I.fillField(fields.city, 'Test City');
    await I.fillField(fields.postcode, 'IG6 1JD');
    await I.click('Save and continue');
  }

  async enterNameAndAddressDetailsWelsh () {
    await I.click('Cadarnhau eich manylion');
    await I.waitForElement(fields.addressLine1, config.WaitForText);
    await I.fillField(fields.addressLine1, 'Test AddressLine1');
    await I.fillField(fields.addressLine2, 'Test AddressLine2');
    await I.fillField(fields.addressLine3, 'Test AddressLine3');
    await I.fillField(fields.city, 'Test City');
    await I.fillField(fields.postcode, 'IG6 1JD');
    await I.click('Save and continue');
  }

  async enterCompanyContactDetails () {
    await I.click('Confirm your details');
    await I.waitForText('Confirm your details', config.WaitForText);
    await I.click('Save and continue');
    await I.seeElement(fields.personError);
    await I.fillField(fields.contactPerson, 'Test Company');
    await I.click('Save and continue');
  }

  async emptyNameAndAddressDetails () {
    await I.click('Confirm your details');
    await I.waitForElement(fields.addressLine1, config.WaitForText);
    await I.fillField(fields.addressLine1, '');
    await I.fillField(fields.addressLine2, '');
    await I.fillField(fields.addressLine3, '');
    await I.fillField(fields.city, '');
    await I.fillField(fields.postcode, '');
    await I.click(fields.correspondenceAddress_yes);
    await I.click('Save and continue');
    await I.seeElement(fields.addressLine1_error);
    await I.seeElement(fields.city_error);
    await I.seeElement(fields.postcode_error);
    await I.seeElement(fields.correspondenceAddressLine1_error);
    await I.seeElement(fields.correspondenceCity_error);
    await I.seeElement(fields.correspondencePostCode_error);
  }

  async enterWrongPostcode() {
    await I.fillField(fields.postcode, 'test');
    await I.fillField(fields.correspondencePostCode, 'test');
    await I.click('Save and continue');
    await I.seeElement(fields.postcode_error);
    await I.seeElement(fields.correspondencePostCode_error);
  }

  async enterAddressManually () {
    await I.click(fields.correspondenceAddress_yes);
    await I.click(fields.enterAddressManuallyLink);
    await I.fillField(fields.correspondenceAddressLine1, 'Flat 10');
    await I.fillField(fields.correspondenceAddressLine2, '823 Knighton Court');
    await I.fillField(fields.correspondenceAddressLine3, 'Cranbrook Road');
    await I.fillField(fields.correspondenceCity, 'Barkingside');
    await I.fillField(fields.correspondencePostCode, 'IG2 6QU');
  }
}

module.exports = NameAndAddressDetailsPage;
