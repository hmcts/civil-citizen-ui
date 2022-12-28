import {IsNotEmpty, Validate} from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';

export class Address {
  @IsNotEmpty({
    message: withMessage(generateErrorMessage, 'ERRORS.VALID_ADDRESS_LINE_1')})
    addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  @IsNotEmpty({message: withMessage(generateErrorMessage, 'ERRORS.VALID_POSTCODE')})
  @Validate(PostcodeValidator, {message: withMessage(generateErrorMessage, 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID')})
    postCode?: string;
  @IsNotEmpty({message: withMessage(generateErrorMessage, 'ERRORS.VALID_CITY')})
    city?: string;
  addressType?: string;

  constructor(
    addressLine1?: string,
    addressLine2?: string,
    addressLine3?: string,
    city?: string,
    postCode?: string,
    addressType?: string,
  ) {
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.addressLine3 = addressLine3;
    this.city = city;
    this.postCode = postCode;
    this.addressType = addressType;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
  static fromObject(value?: Record<string, string>, index?: number): Address {
    const addressType = index === 0 ? 'PRIMARY' : 'CORRESPONDENCE';
    return value.addressLine1 ? new Address(value?.addressLine1[index], value?.addressLine2[index], value?.addressLine3[index], value?.city[index], value?.postCode[index], addressType) : new Address();
  }
}

function withMessage(buildErrorFn: (addressType: string, message:string) => string, errorMessage: string) {
  return (args: any): string => {
    return buildErrorFn(args.object.addressType, errorMessage);
  };
}

function generateErrorMessage(addressType: string, errorMessage: string): string {
  return `${errorMessage}.${addressType}`;
}
