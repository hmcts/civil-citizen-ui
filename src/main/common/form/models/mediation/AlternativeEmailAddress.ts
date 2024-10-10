import {IsDefined, IsEmail, IsNotEmpty} from 'class-validator';

export class AlternativeEmailAddress {
  @IsDefined({ message: 'ERRORS.ENTER_VALID_EMAIL_CARM' })
  @IsNotEmpty({ message: 'ERRORS.ENTER_VALID_EMAIL_CARM' })
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL_CARM'})
    alternativeEmailAddress?: string;

  constructor(alternativeEmailAddress?: string) {
    this.alternativeEmailAddress = alternativeEmailAddress;
  }
}
