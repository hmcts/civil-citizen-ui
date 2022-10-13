import {PartyType} from '../models/partyType';
import {PrimaryAddress} from '../models/primaryAddress';
import {CorrespondenceAddress} from '../models/correspondenceAddress';
import {IsNotEmpty} from 'class-validator';

export class Party {
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  soleTraderTitle?: string;
  soleTraderFirstName?: string;
  soleTraderLastName?: string;
  soleTraderTradingAs?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
    partyName?: string;
  type?: PartyType;
  primaryAddress?: PrimaryAddress;
  postToThisAddress?: string;
  phoneNumber?: string;
  provideCorrespondenceAddress?: string;
  correspondenceAddress?: CorrespondenceAddress;
  dateOfBirth?: Date;
  responseType?: string;
  contactPerson?: string;
  emailAddress?: string;

  constructor(
    partyName?: string,
    contactPerson?: string,
  ) {
    this.partyName = partyName;
    this.contactPerson = contactPerson;
  }
}
