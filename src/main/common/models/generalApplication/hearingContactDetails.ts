// TEMP DTSCCI-5899 QA: phone/email validators removed so invalid values can reach civil-service as field_errors.
// Revert before merge (restore PhoneUKValidator, EmailValidator, IsNotEmpty).
export class HearingContactDetails {
  telephoneNumber?: string;
  emailAddress?: string;

  constructor(telephoneNumber?: string, emailAddress?: string) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.emailAddress = emailAddress;
  }
}
