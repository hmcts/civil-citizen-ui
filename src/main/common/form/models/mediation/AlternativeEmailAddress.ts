import {IsDefined, IsEmail, IsNotEmpty} from 'class-validator';

export class AlternativeEmailAddress {
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL_CARM'})
  @IsDefined({ message: 'ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM' })
  @IsNotEmpty({ message: 'ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM' })
    alternativeEmailAddress?: string;

  constructor(alternativeEmailAddress?: string) {
    this.alternativeEmailAddress = alternativeEmailAddress;
  }
}
