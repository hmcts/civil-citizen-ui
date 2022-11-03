import {IsNotEmpty, MaxLength, Validate, ValidateIf} from 'class-validator';
import {OptionalIntegerValidator} from '../../common/form/validators/optionalIntegerValidator';

export class PartyPhone {

  @ValidateIf(o => o.phone !== undefined)
  @MaxLength(20, {message: 'ERRORS.PHONE_TOO_MANY'})
  @IsNotEmpty({message: 'ERRORS.NOT_TO_REMOVE_PHONE_NUMBER'})
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    phone?: string;

  constructor(phone?: string) {
    this.phone = phone;
  }

}
