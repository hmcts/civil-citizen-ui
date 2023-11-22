import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';

export class CitizenTelephoneNumber {
  carmEnabled?: boolean;
  @ValidateIf(o => o.carmEnabled === true)
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.ENTER_TELEPHONE_NUMBER'})
    telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean, carmEnabled?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
    this.carmEnabled = carmEnabled;
  }
}
