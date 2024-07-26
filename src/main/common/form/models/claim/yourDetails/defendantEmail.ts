import {Validate, ValidateIf} from 'class-validator';
import { EmailValidator } from 'common/form/validators/emailValidator';

export class DefendantEmail {

  @ValidateIf(o => o.emailAddress)
  @Validate(EmailValidator, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    emailAddress?: string;

  constructor(emailAddress?: string) {
    this.emailAddress = emailAddress;
  }
}
