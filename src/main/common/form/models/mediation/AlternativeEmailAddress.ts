import {IsDefined, IsNotEmpty, Validate} from 'class-validator';
import {EmailValidator} from 'form/validators/emailValidator';

export class AlternativeEmailAddress {
  @Validate(EmailValidator, {message: 'ERRORS.ENTER_VALID_EMAIL_CARM'})
  @IsDefined({ message: 'ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM' })
  @IsNotEmpty({ message: 'ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM' })
    alternativeEmailAddress?: string;

  constructor(alternativeEmailAddress?: string) {
    this.alternativeEmailAddress = alternativeEmailAddress;
  }
}
