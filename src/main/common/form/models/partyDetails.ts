import {IsDefined, IsNotEmpty, MaxLength, Validate, ValidateIf} from 'class-validator';
import {Email} from 'models/Email';
import {OptionalIntegerValidator} from 'common/form/validators/optionalIntegerValidator';
import {PartyPhone} from 'models/PartyPhone';
import {DateOfBirth} from 'common/form/models/claim/claimant/dateOfBirth';
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
  @ValidateIf(o => o.partyName !== undefined)
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
    partyName?: string;
  emailAddress?: Email;
  dateOfBirth?: DateOfBirth;
  primaryAddress?: Address;
  correspondenceAddress?: Address;
  postToThisAddress?: string;
  provideCorrespondenceAddress?: string;
  contactPerson?: string;
  responseType?: string;

  constructor(value?: PartyDetails) {
    this.contactPerson = value?.contactPerson;
    this.postToThisAddress = value?.postToThisAddress;
    this.individualTitle = value?.individualTitle;
    this.individualLastName = value?.individualLastName;
    this.individualFirstName = value?.individualFirstName;
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
    this.partyPhone = value?.partyPhone;
    this.provideCorrespondenceAddress = value?.provideCorrespondenceAddress;
    this.emailAddress = value?.emailAddress;
    this.dateOfBirth = value?.dateOfBirth;
    this.primaryAddress = value?.primaryAddress;
    this.correspondenceAddress = value?.correspondenceAddress;
    this.partyName = value?.partyName;
  }

}
