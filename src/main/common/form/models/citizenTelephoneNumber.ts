import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate, ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';
import {NON_NUMERIC_VALUES_NOT_ALLOWED} from '../validationErrors/errorMessageConstants';

export class CitizenTelephoneNumber {

  @Validate(OptionalIntegerValidator, {message: NON_NUMERIC_VALUES_NOT_ALLOWED})
  telephoneNumber?: string
  error?: ValidationError

  constructor(telephoneNumber?: string, error?: ValidationError) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.error = error;
  }

  hasError(): boolean {
    return this.error !== undefined;
  }

  getErrorMessage(): string {
    if (this.hasError()) {
      return new FormValidationError(this.error, 'telephoneNumber').text;
    }
  }
}
