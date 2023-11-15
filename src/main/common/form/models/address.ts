import {IsNotEmpty, Validate} from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';

export class Address {
  @IsNotEmpty({message: 'ERRORS.VALID_ADDRESS_LINE_1'})
    addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
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
