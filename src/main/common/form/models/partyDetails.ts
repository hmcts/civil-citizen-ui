import {IsDefined, IsNotEmpty, MaxLength, Validate, ValidateIf} from 'class-validator';
import {Party} from 'models/party';
import {Email} from 'models/Email';
import {OptionalIntegerValidator} from 'common/form/validators/optionalIntegerValidator';
import {PartyPhone} from 'models/PartyPhone';
import {ClaimantDoB} from 'common/form/models/claim/claimant/claimantDoB';
import {Address} from 'common/form/models/address';

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
    soleTraderTradingAs?: string;
  @ValidateIf(o => o.partyPhone !== undefined)
  @IsNotEmpty({message: 'ERRORS.NOT_TO_REMOVE_PHONE_NUMBER'})
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    partyPhone?: PartyPhone;
  emailAddress?: Email;
  dateOfBirth?: ClaimantDoB;
  primaryAddress?: Address;
  correspondenceAddress?: Address;

  constructor(value: Party) {
    this.individualTitle = value?.individualTitle;
    this.individualFirstName = value?.individualFirstName;
    this.individualLastName = value?.individualLastName;
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
  }
}
