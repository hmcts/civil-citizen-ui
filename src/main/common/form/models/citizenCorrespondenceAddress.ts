import {IsNotEmpty, Validate} from 'class-validator';
import {
  DEFENDANT_POSTCODE_NOT_VALID,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
} from '../validationErrors/errorMessageConstants';
import {PostcodeValidator} from '../../../common/form/validators/postcodeValidator';
import {CorrespondenceAddress} from '../../models/correspondenceAddress';

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

  // TODO : fix any and other places using this model
  constructor(value?:any) {
    this.correspondenceAddressLine1 = value?.correspondenceAddressLine1;
    this.correspondenceAddressLine2 = value?.correspondenceAddressLine2;
    this.correspondenceAddressLine3 = value?.correspondenceAddressLine3;
    this.correspondenceCity = value?.correspondenceCity;
    this.correspondencePostCode = value?.correspondencePostCode;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }

  static fromObject(value?: Record<string, string>): CitizenCorrespondenceAddress {
    return new CitizenCorrespondenceAddress(value);
  }

  static fromJson(value?: CorrespondenceAddress): CitizenCorrespondenceAddress {
    return new CitizenCorrespondenceAddress(value);
  }
}
