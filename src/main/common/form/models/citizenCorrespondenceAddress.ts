import { IsNotEmpty, ValidationError } from 'class-validator';
import {
  NON_CORRESPONDENCE_ADDRESS_VALUE_NOT_ALLOWED,
  NON_CORRESPONDENCE_CITY_OR_TOWN_VALUE_NOT_ALLOWED,
  NON_CORRESPONDENCE_POSTCODE_VALUE_NOT_ALLOWED,
} from '../validationErrors/errorMessageConstants';
import { Form } from './form';

export class CitizenCorrespondenceAddress extends Form {
  @IsNotEmpty({message: NON_CORRESPONDENCE_ADDRESS_VALUE_NOT_ALLOWED})
    correspondenceAddressLine1?: string;
  correspondenceAddressLine2?: string;
  correspondenceAddressLine3?: string;
  @IsNotEmpty({message: NON_CORRESPONDENCE_POSTCODE_VALUE_NOT_ALLOWED})
    correspondencePostCode?: string;
  @IsNotEmpty({message: NON_CORRESPONDENCE_CITY_OR_TOWN_VALUE_NOT_ALLOWED})
    correspondenceCity?: string;

  constructor(
    correspondenceAddressLine1?: string,
    correspondenceAddressLine2?: string,
    correspondenceAddressLine3?: string,
    correspondenceCity?: string,
    correspondencePostCode?: string,
    errors?: ValidationError[]) {
    super(errors);
    this.correspondenceAddressLine1 = correspondenceAddressLine1;
    this.correspondenceAddressLine2 = correspondenceAddressLine2;
    this.correspondenceAddressLine3 = correspondenceAddressLine3;
    this.correspondenceCity = correspondenceCity;
    this.correspondencePostCode = correspondencePostCode;
  }
}
