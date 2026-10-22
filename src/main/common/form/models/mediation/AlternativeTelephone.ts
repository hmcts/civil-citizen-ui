// TEMP DTSCCI-5899 QA: phone validators removed so invalid number can reach civil-service as field_errors.
// Revert before merge (restore IsDefined, IsNotEmpty, PhoneUKValidator).
export class AlternativeTelephone {
  alternativeTelephone?: string;

  constructor(alternativeTelephone?: string) {
    this.alternativeTelephone = alternativeTelephone;
  }
}
