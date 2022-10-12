import {PrimaryAddress} from './primaryAddress';
import {CorrespondenceAddress} from '././correspondenceAddress';
import {PartyType} from './partyType';

export class Respondent {
  primaryAddress?: PrimaryAddress;
  postToThisAddress?: string;
  correspondenceAddress?: CorrespondenceAddress;
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  telephoneNumber?: string;
  dateOfBirth?: Date;
  responseType?: string;
  type: PartyType;
  partyName?: string;
  contactPerson?: string;
  emailAddress?: string;
}

