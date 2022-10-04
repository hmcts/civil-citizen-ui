import {IsEmail, ValidateIf} from "class-validator";

export class ClaimantDefendantEmail {

  @ValidateIf(o => o.emailAddress)
  @IsEmail({IsEmailOption: 'allow_display_name'}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
  emailAddress?: string;

  constructor(emailAddress?: string) {
    this.emailAddress = emailAddress;
  }
}
