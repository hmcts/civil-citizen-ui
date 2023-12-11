import {IsDefined, IsEmail, IsNotEmpty} from 'class-validator';

export class AlternativeEmailAddress {
  @IsDefined({ message: 'ERRORS.ENTER_VALID_EMAIL' })
  @IsNotEmpty({ message: 'ERRORS.ENTER_VALID_EMAIL' })
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    alternativeEmailAddress?: string;

  constructor(alternativeEmailAddress?: string) {
    this.alternativeEmailAddress = alternativeEmailAddress;
  }
}
