import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from 'common/form/validators/phoneUKValidator';

export class PartyPhone {
  @ValidateIf(o => o.phone !== undefined)
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    phone?: string;
  ccdPhoneExist?: boolean;

  constructor(phone?: string, ccdPhoneExist?: boolean) {
    this.phone = phone;
    this.ccdPhoneExist = ccdPhoneExist;
  }

}

export class PartyPhoneMandatory {
  @ValidateIf(o => o.phone !== undefined)
  @IsNotEmpty({message: 'ERRORS.NOT_TO_REMOVE_PHONE_NUMBER'})
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
  phone?: string;
  ccdPhoneExist?: boolean;

  constructor(phone?: string, ccdPhoneExist?: boolean) {
    this.phone = phone;
    this.ccdPhoneExist = ccdPhoneExist;
  }

}
