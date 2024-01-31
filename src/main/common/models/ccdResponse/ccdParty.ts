import {PartyType} from '../partyType';
import {CCDAddress} from './ccdAddress';

export interface CCDParty {
  companyName: string,
  individualDateOfBirth: string,
  individualFirstName: string,
  individualLastName: string,
  individualTitle: string,
  organisationName: string,
  partyEmail: string,
  partyName?: string,
  partyPhone: string,
  partyTypeDisplayValue?: string,
  primaryAddress: CCDAddress,
  soleTraderDateOfBirth: string,
  soleTraderFirstName: string,
  soleTraderLastName: string,
  soleTraderTitle: string,
  soleTraderTradingAs: string,
  type: PartyType,
}
