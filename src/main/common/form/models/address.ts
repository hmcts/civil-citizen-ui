import { IsNotEmpty, MaxLength, Validate } from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';
import { ADDRESS_LINE_MAX_LENGTH } from '../validators/validationConstraints';

export class Address {
  @IsNotEmpty({message: 'ERRORS.VALID_ADDRESS_LINE_1'})
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'Address line1 must no longer than 70 characters' })
    addressLine1?: string;
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'Address line2 must no longer than 70 characters' })  
  addressLine2?: string;
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'Address line3 must no longer than 70 characters' })
  addressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'Town or City must no longer than 70 characters' })
    city?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_POSTCODE'})
  @Validate(PostcodeValidator, {message: 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID'})
    postCode?: string;

  constructor(
    addressLine1?: string,
    addressLine2?: string,
    addressLine3?: string,
    city?: string,
    postCode?: string) {
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.addressLine3 = addressLine3;
    this.city = city;
    this.postCode = postCode;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
  static fromObject(value?: Record<string, string>, index?:number): Address {
    return value.addressLine1 ? new Address(value?.addressLine1[index], value?.addressLine2[index], value?.addressLine3[index], value?.city[index], value?.postCode[index]) : new Address();
  }
}
