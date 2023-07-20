import {Validate} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';

export class CitizenTelephoneNumber {
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
  }
}
