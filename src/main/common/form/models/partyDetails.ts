import {IsDefined, IsNotEmpty, MaxLength, ValidateIf, ValidateNested} from 'class-validator';
import {Address} from '../../../common/form/models/address';

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
  @ValidateIf(o => o.partyName !== undefined)
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
    partyName?: string;
  contactPerson?: string;
  postToThisAddress?: string;
  provideCorrespondenceAddress?: string;
  @ValidateNested()
    primaryAddress?: Address;
  @ValidateIf(o => o.provideCorrespondenceAddress === 'yes')
  @ValidateNested()
    correspondenceAddress?: Address;

  constructor(value: PartyDetails) {
    this.individualTitle = value?.individualTitle;
    this.individualFirstName = value?.individualFirstName;
    this.individualLastName = value?.individualLastName;
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
    this.partyName = value?.partyName;
    this.contactPerson = value?.contactPerson;
    this.postToThisAddress = value?.postToThisAddress;
    this.provideCorrespondenceAddress = value?.provideCorrespondenceAddress;
    this.primaryAddress = value?.primaryAddress;
    this.correspondenceAddress = value?.correspondenceAddress;
  }
}
