import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate, ValidationError} from 'class-validator';
import {VALID_PHONE_NUMBER} from '../validationErrors/errorMessageConstants';
import {Form} from './form';

export class CitizenTelephoneNumber extends Form {

  @Validate(OptionalIntegerValidator, {message: VALID_PHONE_NUMBER})
    telephoneNumber?: string;

  constructor(telephoneNumber?: string, errors?: ValidationError[]) {
    super(errors);
    this.telephoneNumber = telephoneNumber?.trim();
  }
}
