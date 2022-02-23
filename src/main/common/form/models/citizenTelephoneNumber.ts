import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate, ValidationError} from 'class-validator';
import {NON_NUMERIC_VALUES_NOT_ALLOWED} from '../validationErrors/errorMessageConstants';
import {Form} from './form';

export class CitizenTelephoneNumber extends Form {

  @Validate(OptionalIntegerValidator, {message: NON_NUMERIC_VALUES_NOT_ALLOWED})
  telephoneNumber?: string

  constructor(telephoneNumber?: string, errors?: ValidationError[]) {
    super(errors);
    this.telephoneNumber = telephoneNumber?.trim();
  }


}
