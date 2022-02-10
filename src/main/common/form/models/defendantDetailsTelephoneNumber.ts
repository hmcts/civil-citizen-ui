import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate} from 'class-validator';

const NON_NUMERIC_VALUES_NOT_ALLOWED = 'There was a problem. Please enter numeric number';

export class DefendantDetailsTelephoneNumber {

  @Validate(OptionalIntegerValidator, {message: NON_NUMERIC_VALUES_NOT_ALLOWED})
  telephoneNumber?: number

  constructor(telephoneNumber?: number) {
    this.telephoneNumber = telephoneNumber;
  }
}
