import {IsDefined, IsNotEmpty, MaxLength, ValidateIf, ValidateNested} from 'class-validator';
import {Address} from 'form/models/address';
import {GenericForm} from 'form/models/genericForm';

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
  @ValidateIf(o => o.soleTraderTradingAs !== undefined)
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    soleTraderTradingAs?: string;
  @ValidateIf(o => o.partyName !== undefined)
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
    partyName?: string;
  @ValidateIf(o => o.contactPerson !== undefined && o.carmEnabled === true)
  @IsNotEmpty({message: 'ERRORS.VALID_CONTACT_PERSON'})
    contactPerson?: string;
  postToThisAddress?: string;
  provideCorrespondenceAddress?: string;
  @ValidateNested()
    primaryAddress?: Address;
  @ValidateIf(o => o.provideCorrespondenceAddress === 'yes' || o.postToThisAddress === 'yes')
  @ValidateNested()
    correspondenceAddress?: Address;
  carmEnabled?: boolean;

  constructor(value: Record<string, string>, carmEnabled?: boolean) {
    this.individualTitle = value?.individualTitle;
    this.individualLastName = value?.individualLastName;
    this.individualFirstName = value?.individualFirstName;
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
    this.partyName = value?.partyName;
    this.contactPerson = value?.contactPerson;
    this.postToThisAddress = value?.postToThisAddress;
    this.provideCorrespondenceAddress = value?.provideCorrespondenceAddress;
    if(Array.isArray(value?.addressLine1)){
      this.primaryAddress = Address.fromObject(value, 0);
      this.correspondenceAddress = Address.fromObject(value, 1);
    }else{
      this.primaryAddress = new Address(value?.addressLine1, value?.addressLine2, value?.addressLine3, value?.city, value?.postCode);
    }
    this.carmEnabled = carmEnabled;

  }

}

export function generateCorrespondenceAddressErrorMessages(partyDetailsForm : GenericForm<PartyDetails>) {
  partyDetailsForm.errors =  partyDetailsForm.errors
    .map(error => error.property === 'correspondenceAddress' ? ({...error, 'children' : error.children.map(childrenError => ({
      ...childrenError,
      constraints: {'error': Object.values(childrenError.constraints)[0].concat('_CORRESPONDENCE')},
    }))}) : error);
}
