import {IsEmail, ValidateIf} from 'class-validator';

export class DefendantEmail {

  @ValidateIf(o => o.emailAddress)
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    emailAddress?: string;

  constructor(emailAddress?: string) {
    this.emailAddress = emailAddress;
  }
}
