import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class ClaimantTelephone {
  @ValidateIf(o => o.alternativeTelephone !== undefined)
  @IsNotEmpty({message: 'ERRORS.ENTER_TELEPHONE_NUMBER'})
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    alternativeTelephone?: string;
  ccdPhoneExist?: boolean;

  constructor(phone?: string, ccdPhoneExist?: boolean) {
    this.alternativeTelephone = phone;
    this.ccdPhoneExist = ccdPhoneExist;
  }

}
