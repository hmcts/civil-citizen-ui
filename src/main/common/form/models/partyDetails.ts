import {
  ValidateIf,
  MaxLength,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';
import {Party} from '../../models/claim';
export class PartyDetails {

  @ValidateIf(o => o.title !== undefined)
  @MaxLength(35, {message: 'ERRORS.ENTER_VALID_TITLE'})
    title?: string;

  @ValidateIf(o => o.firstName !== undefined)
  @IsDefined({message: 'ERRORS.ENTER_FIRST_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_FIRST_NAME'})
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    firstName?: string;

  @ValidateIf(o => o.lastName !== undefined)
  @IsDefined({message: 'ERRORS.ENTER_LAST_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_LAST_NAME'})
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
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

  static fromObject(value?: Record<string, string>): PartyDetails {
    return new PartyDetails(
      value?.claimantIndividualDetailsTitle,
      value?.claimantIndividualDetailsFirstName,
      value?.claimantIndividualDetailsLastName,
    );
  }

  static fromJson(value?: Party): PartyDetails {
    return new PartyDetails(
      value?.individualTitle,
      value?.individualFirstName,
      value?.individualLastName,
    );
  }
}

