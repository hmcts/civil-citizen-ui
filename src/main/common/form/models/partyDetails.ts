import {
  ValidateIf,
  MaxLength,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';
import {Party} from '../../models/claim';
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
// TODO : fix any
  // check other places using paty details constructor -- claimantIndividualDetailsController  -- saveClaimant
  constructor(value: Party){
    this.individualTitle = value?.individualTitle;
    this.individualFirstName = value?.individualFirstName;
    this.individualLastName = value?.individualLastName;
    this.businessName = value?.businessName;
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

