import {OptionalIntegerValidator} from '../validators/optionalIntegerValidator';
import {Validate, ValidationError} from 'class-validator';
import {Form} from './form';

export class CitizenTelephoneNumber extends Form {
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephoneNumber?: string;

  constructor(telephoneNumber?: string, errors?: ValidationError[]) {
    super(errors);
    this.telephoneNumber = telephoneNumber?.trim();
  }
}
