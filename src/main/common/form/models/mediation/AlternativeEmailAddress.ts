import {IsEmail, ValidateIf} from 'class-validator';

export class AlternativeEmailAddress {
  @ValidateIf(o => o.alternativeEmailAddress)
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    alternativeEmailAddress?: string;

  constructor(alternativeEmailAddress?: string) {
    this.alternativeEmailAddress = alternativeEmailAddress;
  }
}
