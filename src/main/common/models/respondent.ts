import {PrimaryAddress} from './primaryAddress';
import {CounterpartyType} from './counterpartyType';

export class Respondent {
  primaryAddress: PrimaryAddress;
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
  telephoneNumber: string;
  dateOfBirth: Date;
  responseType: string;
  type: CounterpartyType;
}



