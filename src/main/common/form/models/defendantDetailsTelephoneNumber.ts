import {OptionalIntegerValidator} from '../validation/optionalIntegerValidator';
import {toNumberOrUndefined} from '../../utils/numericConverter';
import {Validate} from 'class-validator';
const NON_NUMERIC_VALUES_NOT_ALLOWED = 'There was a problem. Please enter numeric number';
export class DefendantDetailsTelephoneNumber {


  @Validate(OptionalIntegerValidator, {message: NON_NUMERIC_VALUES_NOT_ALLOWED})
  telephoneNumber?: number

  constructor (telephoneNumber?: number) {
    this.telephoneNumber = telephoneNumber;
  }

  static fromObject (value?: any): DefendantDetailsTelephoneNumber {
    if (!value) {
      return value;
    }

    return new DefendantDetailsTelephoneNumber(
      toNumberOrUndefined(value.telephoneNumber),
    );
  }

  deserialize (input: any) : DefendantDetailsTelephoneNumber {
    if(input){
      this.telephoneNumber = input.telephoneNumber;
    }
    return this;
  }
}
