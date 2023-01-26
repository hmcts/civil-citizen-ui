import {Validate} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';

export class CitizenTelephoneNumber {
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephoneNumber?: string;

  constructor(telephoneNumber?: string) {
    this.telephoneNumber = telephoneNumber?.trim();
  }
}
