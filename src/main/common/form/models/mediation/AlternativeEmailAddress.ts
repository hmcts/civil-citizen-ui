// TEMP DTSCCI-5899 QA: email validators removed so an invalid address can reach
// civil-service as details.field_errors (CCD Email type on alternativeMediationEmail).
// Revert before merge (restore IsDefined, IsNotEmpty, IsEmail).
export class AlternativeEmailAddress {
  alternativeEmailAddress?: string;

  constructor(alternativeEmailAddress?: string) {
    this.alternativeEmailAddress = alternativeEmailAddress;
  }
}
