import {IsNotEmpty, Validate} from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';
import {SpecialCharValidator} from 'form/validators/specialCharValidator';
import {MaxLengthValidator} from 'form/validators/maxLengthValidator';

export class Address {
  @IsNotEmpty({ message: 'ERRORS.VALID_ADDRESS_LINE_1' })
  @Validate(MaxLengthValidator)
  @Validate(SpecialCharValidator)
    addressLine1?: string;

  @Validate(MaxLengthValidator)
  @Validate(SpecialCharValidator)
    addressLine2?: string;

  @Validate(MaxLengthValidator)
  @Validate(SpecialCharValidator)
    addressLine3?: string;

  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
  @Validate(MaxLengthValidator)
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
    this.addressLine1 = addressLine1?.trim();
    this.addressLine2 = addressLine2?.trim();
    this.addressLine3 = addressLine3?.trim();
    this.city = city?.trim();
    this.postCode = postCode?.trim();
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
  static fromObject(value?: Record<string, string>, index?:number): Address {
    return value.addressLine1 ? new Address(value?.addressLine1[index], value?.addressLine2[index], value?.addressLine3[index], value?.city[index], value?.postCode[index]) : new Address();
  }
}
