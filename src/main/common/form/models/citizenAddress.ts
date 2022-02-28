import { IsNotEmpty, ValidationError } from 'class-validator';
import {
  NON_ADDRESS_VALUE_NOT_ALLOWED,
  NON_CITY_OR_TOWN_VALUE_NOT_ALLOWED,
  NON_POSTCODE_VALUE_NOT_ALLOWED,
} from '../validationErrors/errorMessageConstants';
import { Form } from './form';

export class CitizenAddress extends Form {
  @IsNotEmpty({message: NON_ADDRESS_VALUE_NOT_ALLOWED})
    primaryAddressLine1?: string;
  primaryAddressLine2?: string;
  primaryAddressLine3?: string;
  @IsNotEmpty({message: NON_POSTCODE_VALUE_NOT_ALLOWED})
    primaryPostCode?: string;
  @IsNotEmpty({message: NON_CITY_OR_TOWN_VALUE_NOT_ALLOWED})
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
