import {PrimaryAddress} from './primaryAddress';
import {CorrespondenceAddress} from '././correspondenceAddress';
import {CounterpartyType} from './counterpartyType';

export class Respondent {
  primaryAddress: PrimaryAddress;
  postToThisAddress?: string;
  correspondenceAddress?: CorrespondenceAddress;
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  telephoneNumber?: string;
  dateOfBirth?: Date;
  responseType: string;
  type: CounterpartyType;
  partyName?: string;
  contactPerson?: string;
}

