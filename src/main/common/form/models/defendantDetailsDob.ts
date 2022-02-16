import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate} from 'class-validator';

const NON_NUMERIC_VALUES_NOT_ALLOWED = 'There was a problem. Please enter numeric number';

export class DefendantDetailsDob {

  @Validate(OptionalIntegerValidator, {message: NON_NUMERIC_VALUES_NOT_ALLOWED})
  dateOfBirth?: Date

  constructor(dateOfBirth?: Date) {
    this.dateOfBirth = dateOfBirth;
  }
}
