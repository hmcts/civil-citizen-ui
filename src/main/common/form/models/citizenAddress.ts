import {IsNotEmpty, Validate, ValidationError} from 'class-validator';
import { Form } from './form';
import {PostcodeValidator} from '../validators/postcodeValidator';

export class CitizenAddress extends Form {
  @IsNotEmpty({message: 'ERRORS.VALID_ADDRESS_LINE_1'})
    primaryAddressLine1?: string;
  primaryAddressLine2?: string;
  primaryAddressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_POSTCODE'})
  @Validate(PostcodeValidator, {message: 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID'})
    primaryPostCode?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
    primaryCity?: string;

  constructor(
    primaryAddressLine1?: string,
    primaryAddressLine2?: string,
    primaryAddressLine3?: string,
    primaryCity?: string,
    primaryPostCode?: string,
    errors?: ValidationError[]) {
    super(errors);
    this.primaryAddressLine1 = primaryAddressLine1;
    this.primaryAddressLine2 = primaryAddressLine2;
    this.primaryAddressLine3 = primaryAddressLine3;
    this.primaryCity = primaryCity;
    this.primaryPostCode = primaryPostCode;
  }
}
