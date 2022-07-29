import {IsNotEmpty, Validate} from 'class-validator';
import {
  DEFENDANT_POSTCODE_NOT_VALID,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
} from '../validationErrors/errorMessageConstants';
import {PostcodeValidator} from '../../../common/form/validators/postcodeValidator';

export class CitizenCorrespondenceAddress {
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
    correspondencePostCode?: string) {
    this.correspondenceAddressLine1 = correspondenceAddressLine1;
    this.correspondenceAddressLine2 = correspondenceAddressLine2;
    this.correspondenceAddressLine3 = correspondenceAddressLine3;
    this.correspondenceCity = correspondenceCity;
    this.correspondencePostCode = correspondencePostCode;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
}
