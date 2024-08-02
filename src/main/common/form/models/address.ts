import { IsNotEmpty, MaxLength, Validate } from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';
import { ADDRESS_LINE_MAX_LENGTH } from '../validators/validationConstraints';
import {SpecialCharValidator} from 'form/validators/specialCharValidator';

export class Address {
  @IsNotEmpty({ message: 'ERRORS.VALID_ADDRESS_LINE_1' })
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'ERRORS.ADDRESS_LINE_TOO_MANY' })
  @Validate(SpecialCharValidator)
    addressLine1?: string;
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'ERRORS.ADDRESS_LINE_TOO_MANY' })
  @Validate(SpecialCharValidator)
    addressLine2?: string;
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'ERRORS.ADDRESS_LINE_TOO_MANY' })
  @Validate(SpecialCharValidator)
    addressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
  @MaxLength(ADDRESS_LINE_MAX_LENGTH, { message: 'ERRORS.TOWN_CITY_TOO_MANY' })
  @Validate(SpecialCharValidator)
    city?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_POSTCODE'})
  @Validate(PostcodeValidator)
    postCode?: string;

  constructor(
    addressLine1?: string,
    addressLine2?: string,
    addressLine3?: string,
    city?: string,
    postCode?: string) {
    this.addressLine1 = addressLine1.trim();
    this.addressLine2 = addressLine2.trim();
    this.addressLine3 = addressLine3.trim();
    this.city = city.trim();
    this.postCode = postCode.trim();
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
  static fromObject(value?: Record<string, string>, index?:number): Address {
    return value.addressLine1 ? new Address(value?.addressLine1[index], value?.addressLine2[index], value?.addressLine3[index], value?.city[index], value?.postCode[index]) : new Address();
  }
}
