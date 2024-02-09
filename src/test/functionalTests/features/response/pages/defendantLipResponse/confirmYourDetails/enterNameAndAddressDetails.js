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

const pageContent = {
  confirmYourDetailsLink: {
    en: 'Confirm your details',
    cy: 'Cadarnhau eich manylion'
  },
  saveAndContinueButtonText: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  }
};

const pageInputs = {
  addressLine1: {
    en: 'Test AddressLine1',
    cy: 'Cyfeiriad Prawf Llinell1'
  },
  addressLine2: {
    en: 'Test AddressLine2',
    cy: 'Cyfeiriad Prawf Llinell2'
  },
  addressLine3: {
    en: 'Test AddressLine3',
    cy: 'Cyfeiriad Prawf Llinell3'
  },
  city: {
    en: 'Test City',
    cy: 'Dinas Prawf'
  },
  postcode: {
    en: 'IG6 1JD',
    cy: 'CF10 1AE'  
  },
}

class NameAndAddressDetailsPage {
  async enterNameAndAddressDetails (claimRef, language = 'en') {
    await I.click(pageContent.confirmYourDetailsLink[language]);
    await I.waitForElement(fields.addressLine1, config.WaitForText);
    await I.fillField(fields.addressLine1, pageInputs.addressLine1[language]);
    await I.fillField(fields.addressLine2, pageInputs.addressLine2[language]);
    await I.fillField(fields.addressLine3, pageInputs.addressLine3[language]);
    await I.fillField(fields.city, pageInputs.city[language]);
    await I.fillField(fields.postcode, pageInputs.postcode[language]);
    await I.click(pageContent.saveAndContinueButtonText[language]);
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
