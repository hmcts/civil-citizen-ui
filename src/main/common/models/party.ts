import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {PartyType} from '../models/partyType';
import {PrimaryAddress} from '../models/primaryAddress';
import {CorrespondenceAddress} from '../models/correspondenceAddress';
import {OptionalIntegerValidator} from '../../common/form/validators/optionalIntegerValidator';

export class Party {
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  soleTraderTitle?: string;
  soleTraderFirstName?: string;
  soleTraderLastName?: string;
  soleTraderTradingAs?: string;
  @ValidateIf(o => o.partyName !== undefined)
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
    partyName?: string;
  type?: PartyType;
  primaryAddress?: PrimaryAddress;
  postToThisAddress?: string;
  @ValidateIf(o => o.partyPhone !== undefined)
  @IsNotEmpty({message: 'ERRORS.NOT_TO_REMOVE_PHONE_NUMBER'})
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    partyPhone?: string;
  provideCorrespondenceAddress?: string;
  correspondenceAddress?: CorrespondenceAddress;
  dateOfBirth?: Date;
  responseType?: string;
  contactPerson?: string;
  emailAddress?: string;
  constructor(value?: Party) {
    this.partyName = value?.partyName;
    this.contactPerson = value?.contactPerson;
    this.partyPhone = value?.partyPhone?.trim();
    this.postToThisAddress = value?.postToThisAddress;
  }
}
