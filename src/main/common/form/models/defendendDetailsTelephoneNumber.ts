import {IsInt, ValidateIf} from 'class-validator';
const NON_NUMERIC_VALUES_NOT_ALLOWED = 'There was a problem. Please enter numeric number';
export class DefendendDetailsTelephoneNumber {

  @ValidateIf(o => o.telephoneNumber !== undefined)
  @IsInt({message:NON_NUMERIC_VALUES_NOT_ALLOWED})
  telephoneNumber?: number
}
