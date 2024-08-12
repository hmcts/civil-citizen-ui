import {IsDefined, IsNotEmpty, MaxLength, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {Address} from 'form/models/address';
import {GenericForm} from 'form/models/genericForm';
import {FullNameValidator} from 'form/validators/fullNameValidator';
import {SpecialCharValidator} from 'form/validators/specialCharValidator';

export class PartyDetails {

  @ValidateIf(o => o.title !== undefined)
  @Validate(SpecialCharValidator)
  @Validate(FullNameValidator,['nameLength', ' '])
    title?: string;

  @ValidateIf(o => o.firstName !== undefined)
  @IsDefined({message: 'ERRORS.ENTER_FIRST_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_FIRST_NAME'})
  @Validate(SpecialCharValidator)
  @Validate(FullNameValidator,['nameLength', ' '])
    firstName?: string;

  @ValidateIf(o => o.lastName !== undefined)
  @IsDefined({message: 'ERRORS.ENTER_LAST_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_LAST_NAME'})
  @Validate(SpecialCharValidator)
  @Validate(FullNameValidator,['nameLength', 'ERRORS.TEXT_TOO_MANY'])
    lastName?: string;

  nameLength?: number;
  partyNameLength?: number;

  @ValidateIf(o => o.soleTraderTradingAs !== undefined)
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    soleTraderTradingAs?: string;

  @ValidateIf(o => o.partyName !== undefined)
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
  @Validate(SpecialCharValidator)
  @Validate(FullNameValidator,['partyNameLength', 'ERRORS.TEXT_TOO_MANY'])
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
    this.title = value?.title?.trim();
    this.lastName = value?.lastName?.trim();
    this.firstName = value?.firstName?.trim();
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
    this.partyName = value?.partyName?.trim();
    this.contactPerson = value?.contactPerson;
    this.postToThisAddress = value?.postToThisAddress;
    this.provideCorrespondenceAddress = value?.provideCorrespondenceAddress;
    if(Array.isArray(value?.addressLine1)){
      this.primaryAddress = Address.fromObject(value, 0);
      this.correspondenceAddress = Address.fromObject(value, 1);
    }else{
      this.primaryAddress = new Address(value?.addressLine1?.trim(), value?.addressLine2?.trim(), value?.addressLine3?.trim(), value?.city?.trim(), value?.postCode?.trim());
    }
    this.carmEnabled = carmEnabled;
    this.nameLength = value?.title?.trim().length === 0? value?.firstName?.trim().length + value?.lastName?.trim().length + 1
      : value?.title?.trim().length + value?.firstName?.trim().length + value?.lastName?.trim().length + 2;
    this.partyNameLength = value?.partyName?.trim().length;
  }

}

export function generateCorrespondenceAddressErrorMessages(partyDetailsForm : GenericForm<PartyDetails>) {
  partyDetailsForm.errors =  partyDetailsForm.errors
    .map(error => error.property === 'correspondenceAddress' ? ({...error, 'children' : error.children.map(childrenError => ({
      ...childrenError,
      constraints: {'error': Object.values(childrenError.constraints)[0].concat('_CORRESPONDENCE')},
    }))}) : error);
}
