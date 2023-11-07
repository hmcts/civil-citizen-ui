import {PartyType} from '../partyType';
import {CCDAddress} from './ccdAddress';

export interface CCDParty {
  companyName: string,
  individualDateOfBirth: Date,
  individualFirstName: string,
  individualLastName: string,
  individualTitle: string,
  organisationName: string,
  partyEmail: string,
  partyName?: string,
  partyPhone: string,
  partyTypeDisplayValue?: string,
  primaryAddress: CCDAddress,
  soleTraderDateOfBirth: Date,
  soleTraderFirstName: string,
  soleTraderLastName: string,
  soleTraderTitle: string,
  soleTraderTradingAs: string,
  type: PartyType,
}
