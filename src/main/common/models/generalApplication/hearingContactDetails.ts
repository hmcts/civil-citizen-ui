import {IsEmail, IsNotEmpty, Validate} from 'class-validator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class HearingContactDetails {
  @Validate(PhoneUKValidator, {message: 'ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'})
    telephoneNumber?: string;

  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'})
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'})
    emailAddress?: string;

  constructor(telephoneNumber?: string, emailAddress?: string) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.emailAddress = emailAddress;
  }
}
