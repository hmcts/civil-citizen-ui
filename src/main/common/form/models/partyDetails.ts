import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {Party} from '../../models/party';

export class PartyDetails {

  @ValidateIf(o => o.individualTitle !== undefined)
  @MaxLength(35, {message: 'ERRORS.ENTER_VALID_TITLE'})
    individualTitle?: string;

  @ValidateIf(o => o.individualFirstName !== undefined)
  @IsDefined({message: 'ERRORS.ENTER_FIRST_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_FIRST_NAME'})
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    individualFirstName?: string;

  @ValidateIf(o => o.individualLastName !== undefined)
  @IsDefined({message: 'ERRORS.ENTER_LAST_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_LAST_NAME'})
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    individualLastName?: string;

  constructor(
    title?: string,
    firstName?: string,
    lastName?: string,
  ) {
    this.title = title;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  // static fromObject(value?: Record<string, string>): PartyDetails {
  //   return new PartyDetails(
  //     value?.individualTitle,
  //     value?.individualFirstName,
  //     value?.individualLastName,
  //     value?.businessName,
  //   );
  // }

  // static fromJson(value?: Party): PartyDetails {
  //   return new PartyDetails(
  //     value?.individualTitle,
  //     value?.individualFirstName,
  //     value?.individualLastName,
  //     value?.businessName,
  //   );
  // }
}

