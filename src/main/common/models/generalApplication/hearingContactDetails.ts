import {IsNotEmpty, Validate} from 'class-validator';
import { EmailValidator } from 'common/form/validators/emailValidator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class HearingContactDetails {
  @Validate(PhoneUKValidator, {message: 'ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'})
    telephoneNumber?: string;

  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'})
  @Validate(EmailValidator, {message: 'ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'})
    emailAddress?: string;

  constructor(telephoneNumber?: string, emailAddress?: string) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.emailAddress = emailAddress;
  }
}
