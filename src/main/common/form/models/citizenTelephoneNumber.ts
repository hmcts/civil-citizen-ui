import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';

// This class will be used after CARM release
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

// This class will be deleted after CARM release
export class CitizenTelephoneNumberOptional extends CitizenTelephoneNumber {
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephoneNumber?: string;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean) {
    super(telephoneNumber, ccdPhoneExist);
  }
}
