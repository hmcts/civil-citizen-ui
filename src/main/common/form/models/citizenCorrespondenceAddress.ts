import {IsNotEmpty, Validate} from 'class-validator';
import {PostcodeValidator} from 'form/validators/postcodeValidator';
import {CorrespondenceAddress} from 'models/correspondenceAddress';

export class CitizenCorrespondenceAddress {
  @IsNotEmpty({message: 'ERRORS.VALID_CORRESPONDENCE_ADDRESS_LINE_1'})
    correspondenceAddressLine1?: string;
  correspondenceAddressLine2?: string;
  correspondenceAddressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CORRESPONDENCE_POSTCODE'})
  @Validate(PostcodeValidator, {message: 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID'})
    correspondencePostCode?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CORRESPONDENCE_CITY'})
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

  static fromObject(value?: Record<string, string>): CitizenCorrespondenceAddress {
    return new CitizenCorrespondenceAddress(
      value?.correspondenceAddressLine1,
      value?.correspondenceAddressLine2,
      value?.correspondenceAddressLine3,
      value?.correspondenceCity,
      value?.correspondencePostCode,
    );
  }

  static fromJson(value?: CorrespondenceAddress): CitizenCorrespondenceAddress {
    return new CitizenCorrespondenceAddress(
      value?.AddressLine1,
      value?.AddressLine2,
      value?.AddressLine3,
      value?.PostTown,
      value?.PostCode,
    );
  }
}
