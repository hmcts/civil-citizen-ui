import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';

export class CitizenTelephoneNumberOptional {
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
  }
}

export class CitizenTelephoneNumber {
  @ValidateIf(o => o.telephoneNumber !== undefined)
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.ENTER_TELEPHONE_NUMBER'})
  telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
  }
}
