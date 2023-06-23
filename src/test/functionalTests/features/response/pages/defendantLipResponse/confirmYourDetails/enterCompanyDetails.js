const I = actor();

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
  enterCompanyDetails () {
    I.click('Confirm your details');
    I.fillField(fields.contactPerson, 'TestPerson');
    I.fillField(fields.addressLine1, 'Test AddressLine1');
    I.fillField(fields.addressLine2, 'Test AddressLine2');
    I.fillField(fields.addressLine3, 'Test AddressLine3');
    I.fillField(fields.city, 'Test City');
    I.fillField(fields.postcode, 'IG6 1JD');
  }

  enterCorrespondenceAddressManually () {
    I.click(fields.correspondenceAddress_yes);
    I.click('Enter address manually');
    I.fillField(fields.correspondenceAddressLine1, 'Flat 10');
    I.fillField(fields.correspondenceAddressLine2, '823 Knighton Court');
    I.fillField(fields.correspondenceAddressLine3, 'Cranbrook Road');
    I.fillField(fields.correspondenceCity, 'Barkingside');
    I.fillField(fields.correspondencePostCode, 'IG2 6QU');
    I.click('Save and continue');
  }
}

module.exports = EnterCompanyDetails;
