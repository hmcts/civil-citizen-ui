import {
  VALID_TITLE,
  VALID_FIRST_NAME,
  VALID_LAST_NAME,
} from '../validationErrors/errorMessageConstants';
import {
  ValidateIf,
  MaxLength,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';
// tODO : convert error messages to traslation keys
export class PartyDetails {

  @ValidateIf(o => o.title !== undefined)
  @MaxLength(35, {message: VALID_TITLE})
    title?: string;

  @ValidateIf(o => o.firstName !== undefined)
  @IsDefined({message: VALID_FIRST_NAME})
  @IsNotEmpty({message: VALID_FIRST_NAME})
  @MaxLength(255, {message: VALID_FIRST_NAME})
    firstName?: string;

  @ValidateIf(o => o.lastName !== undefined)
  @IsDefined({message: VALID_LAST_NAME})
  @IsNotEmpty({message: VALID_LAST_NAME})
  @MaxLength(255, {message: VALID_LAST_NAME})
    lastName?: string;

  constructor(
    title?: string,
    firstName?: string,
    lastName?: string,
  ){
    this.title = title;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
}

