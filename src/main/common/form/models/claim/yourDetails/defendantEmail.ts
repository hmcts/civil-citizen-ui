// TEMP DTSCCI-5899 QA: EmailValidator removed so invalid email can reach civil-service as field_errors.
// Demo branch only — do not merge. Revert / delete branch after screenshots.
export class DefendantEmail {

  emailAddress?: string;

  constructor(emailAddress?: string) {
    this.emailAddress = emailAddress;
  }
}
