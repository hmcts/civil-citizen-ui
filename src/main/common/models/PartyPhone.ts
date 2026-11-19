// TEMP OCCC-691 QA: phone validators removed so invalid number can reach civil-service as field_errors.
// Revert before merge (restore PhoneUKValidator, IsNotEmpty, ValidateIf).
export class PartyPhone {
  phone?: string;
  ccdPhoneExist?: boolean;

  constructor(phone?: string, ccdPhoneExist?: boolean) {
    this.phone = phone;
    this.ccdPhoneExist = ccdPhoneExist;
  }

}
