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

  @ValidateIf(o => o.businessName !== undefined)
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    businessName?: string;

  constructor(value: Party) {
    this.individualTitle = value?.individualTitle;
    this.individualFirstName = value?.individualFirstName;
    this.individualLastName = value?.individualLastName;
    this.businessName = value?.businessName;
  }
}
