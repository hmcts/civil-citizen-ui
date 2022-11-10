import {CCDParty} from '../../../common/models/ccdResponse/ccdParty';
import {Party} from '../../../common/models/party';
import {PartyType} from '../../../common/models/partyType';
import {toCCDAddress} from './convertToCCDAddress';

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party?.type === PartyType.COMPANY ? party?.partyName : undefined,
    individualDateOfBirth: party?.type === PartyType.INDIVIDUAL ? party?.dateOfBirth?.toString() : undefined,
    individualFirstName: party?.individualFirstName,
    individualLastName: party?.individualLastName,
    individualTitle: party?.individualTitle,
    organisationName: party?.type === PartyType.ORGANISATION ? party?.partyName : undefined,
    partyEmail: party?.emailAddress,
    partyPhone: party?.partyPhone,
    primaryAddress: toCCDAddress(party?.primaryAddress),
    soleTraderDateOfBirth: party?.type === PartyType.SOLE_TRADER ? party?.dateOfBirth?.toString() : undefined,
    soleTraderFirstName: party?.soleTraderFirstName,
    soleTraderLastName: party?.soleTraderLastName,
    soleTraderTitle: party?.soleTraderTitle,
    soleTraderTradingAs: party?.soleTraderTradingAs,
    type: party?.type,
  };
};
