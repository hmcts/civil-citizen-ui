import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate, ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

export class CitizenTelephoneNumber {

  @Validate(OptionalIntegerValidator, {message: NON_NUMERIC_VALUES_NOT_ALLOWED})
  telephoneNumber?: number
  error?: ValidationError

  constructor(telephoneNumber?: number, error?: ValidationError) {
    this.telephoneNumber = telephoneNumber;
    this.error = error;
  }

  hasError(): boolean {
    return this.error !== undefined;
  }

  getErrorMessage(): string {
    if (this.hasError()) {
      return new FormValidationError(this.error, 'telephoneNumber').message;
    }
  }
}
