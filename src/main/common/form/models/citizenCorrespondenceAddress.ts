import {IsNotEmpty, Validate, ValidationError} from 'class-validator';
import {
  DEFENDANT_POSTCODE_NOT_VALID,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
} from '../validationErrors/errorMessageConstants';
import { Form } from './form';
import {PostcodeValidator} from '../../../common/form/validators/postcodeValidator';

export class CitizenCorrespondenceAddress extends Form {
  @IsNotEmpty({message: VALID_CORRESPONDENCE_ADDRESS_LINE_1})
    correspondenceAddressLine1?: string;
  correspondenceAddressLine2?: string;
  correspondenceAddressLine3?: string;
  @IsNotEmpty({message: VALID_CORRESPONDENCE_POSTCODE})
  @Validate(PostcodeValidator, {message: DEFENDANT_POSTCODE_NOT_VALID})
    correspondencePostCode?: string;
  @IsNotEmpty({message: VALID_CORRESPONDENCE_CITY})
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

  isEmpty() {
    return Object.values(this).some(value => value === undefined || value === '' );

  }

}
