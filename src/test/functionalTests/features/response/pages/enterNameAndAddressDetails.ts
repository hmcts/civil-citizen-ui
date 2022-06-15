import I = CodeceptJS.I

const I: I = actor();

const fields = {
  addressLine1: 'input[id="primaryAddressLine1"]',
  addressLine2: 'input[id="primaryAddressLine2"]',
  addressLine3: 'input[id="primaryAddressLine3"]',
  city: 'input[id="primaryCity"]',
  postcode: 'input[id="primaryPostCode"]',
  correspondenceAddress_yes: 'input[id="postToThisAddress-2"]',
  enterAddressManuallyLink: 'a[id="enterAddressManually"]',
  correspondenceAddressLine1: 'input[id="correspondenceAddressLine1"]',
  correspondenceAddressLine2: 'input[id="correspondenceAddressLine2"]',
  correspondenceAddressLine3: 'input[id="correspondenceAddressLine3"]',
  correspondenceCity: 'input[id="correspondenceCity"]',
  correspondencePostCode: 'input[id="correspondencePostCode"]',
};


const buttons = {
  saveAndContinue: 'button.govuk-button',
};

export class NameAndAddressDetailsPage {
  enterNameAndAddressDetails (claimRef): void {
    I.amOnPage('/case/'+claimRef+'/response/your-details');
    I.fillField(fields.addressLine1, 'Test AddressLine1');
    I.fillField(fields.addressLine2, 'Test AddressLine2');
    I.fillField(fields.addressLine3, 'Test AddressLine3');
    I.fillField(fields.city, 'Test City');
    I.fillField(fields.postcode, 'IG6 1JD');

    I.click(fields.correspondenceAddress_yes);
    I.click(fields.enterAddressManuallyLink);
    I.fillField(fields.correspondenceAddressLine1, 'Flat 10');
    I.fillField(fields.correspondenceAddressLine2, '823 Knighton Court');
    I.fillField(fields.correspondenceAddressLine3, 'Cranbrook Road');
    I.fillField(fields.correspondenceCity, 'Barkingside');
    I.fillField(fields.correspondencePostCode, 'IG2 6QU');

    I.click(buttons.saveAndContinue);
  }
}
