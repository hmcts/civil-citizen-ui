import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate} from 'class-validator';
import {VALID_PHONE_NUMBER} from '../validationErrors/errorMessageConstants';

export class CitizenTelephoneNumber {

  @Validate(OptionalIntegerValidator, {message: VALID_PHONE_NUMBER})
    telephoneNumber?: string;

  constructor(telephoneNumber?: string) {
    this.telephoneNumber = telephoneNumber?.trim();
  }


}
