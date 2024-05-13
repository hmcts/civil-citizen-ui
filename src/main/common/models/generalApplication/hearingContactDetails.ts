import {IsDefined, IsEmail, IsNotEmpty, Validate} from 'class-validator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class HearingContactDetails {
  @Validate(PhoneUKValidator, {message: 'ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'})
    preferredTelephoneNumber?: string;

  @IsDefined({message: 'ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'})
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'})
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    preferredEmailAddress?: string;

  constructor(preferredTelephoneNumber?: string, preferredEmailAddress?: string) {
    this.preferredTelephoneNumber = preferredTelephoneNumber?.trim();
    this.preferredEmailAddress = preferredEmailAddress;
  }
}
