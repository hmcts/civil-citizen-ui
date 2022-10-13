import {IsNotEmpty, Validate} from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';
import {CorrespondenceAddress} from '../../models/correspondenceAddress';

export class Address {
  @IsNotEmpty({message: 'ERRORS.VALID_ADDRESS_LINE_1'})
    primaryAddressLine1?: string;
  primaryAddressLine2?: string;
  primaryAddressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_POSTCODE'})
  @Validate(PostcodeValidator, {message: 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID'})
    primaryPostCode?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
    primaryCity?: string;

  constructor(value:any) {
    this.primaryAddressLine1 = value?.primaryAddressLine1;
    this.primaryAddressLine2 = value?.primaryAddressLine2;
    this.primaryAddressLine3 = value?.primaryAddressLine3;
    this.primaryCity = value?.primaryCity;
    this.primaryPostCode = value?.primaryPostCode;
  }

  static fromObject(value?: Record<string, string>): Address {
    return new Address(value);
  }

  static fromJson(value?: CorrespondenceAddress): Address {
    return new Address(value);
  }
}
