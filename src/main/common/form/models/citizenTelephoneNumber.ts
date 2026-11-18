// TEMP OCCC-691 QA: phone validators removed so invalid number can reach civil-service as field_errors.
// Revert before merge (restore PhoneUKValidator, IsNotEmptyForParty).
export class CitizenTelephoneNumber {
  mandatoryForParty?: boolean;
  telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean, mandatoryForParty?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
    this.mandatoryForParty = mandatoryForParty;
  }
}
