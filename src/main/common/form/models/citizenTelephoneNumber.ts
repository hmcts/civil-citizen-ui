import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate} from 'class-validator';

export class CitizenTelephoneNumber{

  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephoneNumber?: string;

  constructor(telephoneNumber?: string) {
    this.telephoneNumber = telephoneNumber?.trim();
  }
}
