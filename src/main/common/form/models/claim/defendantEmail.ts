import {IsEmail, ValidateIf} from "class-validator";

export class DefendantEmail {

  @ValidateIf(o => o.emailAddress)
  @IsEmail({IsEmailOption: 'allow_display_name'}, {message: 'ERRORS.VALID_ENTER_VALID_EMAIL_ADDRESS'})
  emailAddress?: string;

  constructor(emailAddress?: string) {
    this.emailAddress = emailAddress;
  }
}
