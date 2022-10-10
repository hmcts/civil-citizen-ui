import {PartyType} from '../models/partyType';
import {PrimaryAddress} from '../models/primaryAddress';
import {CorrespondenceAddress} from '../models/correspondenceAddress';

export class Party {
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  soleTraderTitle?: string;
  soleTraderFirstName?: string;
  soleTraderLastName?: string;
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
}
