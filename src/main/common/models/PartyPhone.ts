import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from 'common/form/validators/phoneUKValidator';

export class PartyPhone {
  @ValidateIf(o => o.phone !== undefined)
  @IsNotEmpty({message: 'ERRORS.NOT_TO_REMOVE_PHONE_NUMBER'})
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    phone?: string;

  constructor(phone?: string) {
    this.phone = phone;
  }

}
